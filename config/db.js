const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5433,
  password: "5407",
  database: "aboin_db",
});

module.exports = pool;
