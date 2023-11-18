//all packages that are required
const path = require("path");

const express = require("express");

const userRoutes = require("./routes/users");
const db = require("./data/database");

const app = express();

//starting ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middleware
app.use(express.urlencoded({ extended: false }));

//folders that can be uccessed by site visitors
app.use(express.static("public"));
app.use("/images", express.static("images"));

//routes of all pages to be rendered in get and post request
app.use(userRoutes);

//oppenned post and connection to database
db.connectToDatabase().then(function () {
  app.listen(3000);
});
