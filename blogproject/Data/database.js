//connecting to the database

const mysql = require("mysql2/promise");

mysql.createPool({
  host: "localhost",
  database: "blog",
  user: "root",
  password: "115371",
});

module.exports = pool;
