const path = require("path");
const fs = require("fs");
const router = require("express").Router();
const db = require("../services/sqliteConfig");
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
