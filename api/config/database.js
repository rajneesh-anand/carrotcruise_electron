const { createPool } = require("mysql");

const pool = createPool({
  host: process.env.DB_HOST_SERVER,
  port: 3306,
  user: "root",
  password: "raj2neo",
  database: "hemsu",
  connectionLimit: 10,
  multipleStatements: true,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
});

module.exports = pool;

// user grant comand

// CREATE USER 'root'@'192.168.0.104' IDENTIFIED BY 'raj2neo';
// GRANT ALL PRIVILEGES ON *.* TO 'root'@'203.0.113.2' WITH GRANT OPTION;
// FLUSH PRIVILEGES;
// ALTER USER 'root'@'192.168.0.107' IDENTIFIED WITH mysql_native_password BY 'raj2neo';
// flush privileges;
