const express = require("express");
const multer = require("multer");

const db = require("../data/database"); //importing database

//using multer to store files
const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storageConfig });

const router = express.Router();

//route for the home page and collection of database data
router.get("/", async function (req, res) {
  const users = await db.getDb().collection("users").find().toArray();
  res.render("profiles", { users: users });
});

//route to the new user page
router.get("/new-user", function (req, res) {
  res.render("new-user");
});

//adding multer middleware to aroute that uploads files to a database
router.post("/profiles", upload.single("image"), async function (req, res) {
  const uploadedImageFile = req.file;
  const userData = req.body;

  await db.getDb().collection("users").insertOne({
    name: userData.username,
    imagePath: uploadedImageFile.path,
  });

  res.redirect("/");
});

module.exports = router;
