const path = require("path");
const fs = require("fs");
const router = require("express").Router();

var sqlite3 = require("sqlite3").verbose();
const db_path = path.join(__dirname, "../../neodb.db");
console.log("path", db_path);

var db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to database successfully");
});

router.post("/company", (req, res) => {
  try {
    const data = req.body;
    const companyLogo = fs.readFileSync(req.body.company_logo);
    db.run(
      `INSERT INTO company(Company_Code,Name,Company_Logo) VALUES(?,?,?)`,
      [data.prefix, data.name, companyLogo],
      function (err) {
        if (err) {
          console.log(err.message);
          res.send({ message: err.message });
        } else {
          res.send({ message: "success" });
        }
      }
    );
  } catch (err) {
    console.log(err);
  } finally {
    db.close();
  }
});

router.get("/company", (req, res) => {
  let sql = `SELECT * from company`;
  db.get(sql, [], (err, row) => {
    if (err) {
      return console.error(err.message);
    } else {
      return res.json({
        success: 1,
        data: row,
      });
    }
  });
});

module.exports = router;
