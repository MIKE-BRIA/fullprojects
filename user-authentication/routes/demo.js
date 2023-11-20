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
  res.render("signup");
});

//route to the login page

router.get("/login", function (req, res) {
  res.render("login");
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
    console.log("Please enter the required data");
    return res.redirect("/signup");
  }

  //checking if user exist already
  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    console.log("User already exists");
    return res.redirect("/signup");
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
    console.log("could not login");
    return res.redirect("/login");
  }
  //checking if the password entered in equal to the hashed on in the database
  const passwordsAreEqual = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );

  if (!passwordsAreEqual) {
    console.log("could not login-seems like you entered the wrong password");
    return res.redirect("/login");
  }

  //adding a new piece of data to the session if a user login succesfully
  req.session.user = { id: existingUser._id, email: existingUser.email };
  req.session.isAuthenticated = true;

  //writing the session to the database
  req.session.save(function () {
    res.redirect("/admin"); //save the session then redirect user to admin page
  });
});

//route that render the admin page

router.get("/admin", function (req, res) {
  //checking the sessions of incoming request
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
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
