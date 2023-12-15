const mongodb = require("mongodb");

const db = require("../data/database");

const ObjectId = mongodb.ObjectId;

class Post {
  constructor(title, content, id) {
    this.title;
    this.content;

    if (id) {
      this.id = new ObjectId(id);
    }
  }

  async save() {
    let result;

    if (this.id) {
      result = await db
        .getDb()
        .collection("posts")
        .updateOne(
          { _id: this.id },
          { $set: { title: this.title, content: this.content } }
        );
    } else {
      result = await db.getDb().collection("posts").insertOne({
        title: this.title,
        contect: this.content,
      });
    }

    return result;
  }
}

module.exports = Post;
