const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

// route for getting data from the database to the home page

router.get("/posts", async function (req, res) {
  const posts = await db
    .getDb()
    .collection("posts")
    .find({}, { title: 1, summary: 1, "author.name": 1 })
    .toArray();

  res.render("posts-list", { posts: posts });
});

// route to getting the authors names from the database

router.get("/new-post", async function (req, res) {
  const authors = await db.getDb().collection("authors").find().toArray();
  res.render("create-post", { authors: authors });
});

// route for submitting data to the database

router.post("/posts", async function (req, res) {
  const authorId = new ObjectId(req.body.author);
  const author = await db
    .getDb()
    .collection("authors")
    .findOne({ _id: authorId });

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email,
    },
  };

  const result = await db.getDb().collection("posts").insertOne(newPost);
  console.log(result);

  res.redirect("/posts");
});

// route to view the whole post fetching everything from the posts table by id

router.get("/posts/:id", async function (req, res, next) {
  //getting data from the database
  const postId = req.params.id;

  //handling error that may occur by entering wrong id
  try {
    postId = new ObjectId(postId);
  } catch (error) {
    return res.status(404).render("404");
    //return next (error)  -------submitting the error to the middleware
  }

  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: postId }, { summary: 0 });

  if (!post) {
    return res.status(404).render("404");
  }

  //human readable date
  post.humanReadableDate = post.date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  //machine readable date
  post.date = post.date.toISOString();

  res.render("post-detail", { post: post });
});

//route for editing posts

router.get("/posts/:id/edit", async function (req, res) {
  //getting data from database
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) }, { title: 1, summary: 1, body: 1 });

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: post });
});

//post route to submmit the edited data to the database then get back to home page

router.post("/posts/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id); //getting the id of the updated post
  const results = await db
    .getDb()
    .collection("posts")
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
        },
      }
    );

  res.redirect("/posts");
});

//deleting  a post

router.post("/posts/:id/delete", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const results = await db
    .getDb()
    .collection("posts")
    .deleteOne({ _id: postId });

  res.redirect("/posts");
});

module.exports = router;
