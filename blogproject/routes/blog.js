const express = require("express");

const db = require("../Data/database");

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", function (req, res) {
  res.render("posts-list");
});

router.get("/new-post", async function (req, res) {
  const [authors] = await db.query("select * from authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    "insert into post (title, summary, body, author_id) values(?)",
    [data]
  );

  res.redirect("/posts");
});

module.exports = router;
