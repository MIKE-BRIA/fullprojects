const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../data/database");

const router = express.Router();

//route to the home-page

router.get("/", function (req, res) {
  res.render("welcome");
});

//route to the sign-up page

router.get("/signup", function (req, res) {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }

  //deleteing the input value stored in the session
  req.session.inputData = null;

  res.render("signup", { inputData: sessionInputData });
});

//route to the profile page

router.get("/profile", function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
  }

  res.render("profile");
});

//route to the login page

router.get("/login", function (req, res) {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",

      password: "",
    };
  }

  res.render("login", { inputData: sessionInputData });
});

//route that collect sign-up data to the database

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredConfirmEmail = userData["confirm-email"]; //we use the brackets because of the dash
  const enteredPassword = userData.password;

  //checking userdata
  if (
    !enteredEmail ||
    !enteredConfirmEmail ||
    !enteredPassword ||
    enteredPassword.trim() < 6 ||
    enteredEmail !== enteredConfirmEmail ||
    !enteredEmail.includes("@")
  ) {
    //storing data temporarily on the server using sessions
    //this does not give access to the admin pages
    req.session.inputData = {
      hasError: true,
      message: "invalid input-please check entered data",
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
    };

    req.session.save(function () {
      res.redirect("/signup");
    });

    return;
  }

  //checking if user exist already
  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "User exist already",
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
    };

    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }

  //hashing passwords
  const hashedPassword = await bcrypt.hash(enteredPassword, 12); // 12 is the strength of the hash

  const user = {
    email: enteredEmail,
    password: hashedPassword,
  };

  await db.getDb().collection("users").insertOne(user);

  res.redirect("/login");
});

//route that collect login data to the database

router.post("/login", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredPassword = userData.password;
  //checking if the login user exist in our database
  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (!existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "Could not login check your credentials",
      email: enteredEmail,
      password: enteredPassword,
    };

    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }
  //checking if the password entered in equal to the hashed on in the database
  const passwordsAreEqual = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );

  if (!passwordsAreEqual) {
    req.session.inputData = {
      hasError: true,
      message: "Could not login check your credentials",
      email: enteredEmail,
      password: enteredPassword,
    };

    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  //adding a new piece of data to the session if a user login succesfully
  req.session.user = {
    id: existingUser._id,
    email: existingUser.email,
  };
  req.session.isAuthenticated = true;

  //writing the session to the database
  req.session.save(function () {
    res.redirect("/profile"); //save the session then redirect user to admin page
  });
});

//route that render the admin page

router.get("/admin", async function (req, res) {
  //checking the sessions of incoming request
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
  }

  const user = await db
    .getDb()
    .collection("users")
    .findOne({ _id: req.session.user.id });

  if (!user || !user.isAdmin) {
    res.status(403).render("403");
  }

  res.render("admin");
});

//route that seems to delete user data from the database

router.post("/logout", function (req, res) {
  //delete authentication data from the session
  //Or delete entire session
  req.session.user = null;
  req.session.isAuthenticated = false;

  res.redirect("/");
});

module.exports = router;
