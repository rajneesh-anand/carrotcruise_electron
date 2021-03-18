const { create, getUserByUserEmail, getUsers } = require("../services/users");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const pool = require("../config/database");
const db = require("../services/sqliteConfig");

module.exports = {
  createUser: (req, res) => {
    const data = req.body;
    const args = {
      userName: req.body.first_name,
      email: req.body.email,
    };

    const salt = genSaltSync(10);
    data.password = hashSync(data.password, salt);

    pool.query(
      "SELECT COUNT(*) AS cnt FROM users WHERE first_name = ? and email= ?",
      [args.userName, args.email],
      (err, results) => {
        if (err) {
          return res.status(403).json({
            error: err,
          });
        }
        if (results[0].cnt > 0) {
          return res.status(403).json({
            message: "User already exists !",
          });
        }

        create(data, (err, results) => {
          if (err) {
            return res.status(500).json({
              success: 0,
              message: "Database connection error !",
            });
          }
          return res.status(200).json({
            message: "User saved successfully !",
            data: results,
          });
        });
      }
    );
  },
  login: (req, res) => {
    const body = req.body;

    getUserByUserEmail(body.email, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          message: "User does not exists, Contact Admin !",
        });
      }
      const result = compareSync(body.password, results.password);
      if (result) {
        results.password = undefined;
        const jsontoken = sign({ result: results }, "neosoft@1234", {
          expiresIn: "1h",
        });
        return res.json({
          message: "login success",
          token: jsontoken,
          name: results.first_name,
          email: results.email,
          role: results.role,
        });
      } else {
        return res.json({
          success: 0,
          message: "Password || Email does not match !",
        });
      }
    });
  },
  updateUser: (req, res) => {
    const data = req.body;
    const args = {
      email: req.body.email,
    };
    const salt = genSaltSync(10);
    data.password = hashSync(data.password, salt);

    db.all(
      "SELECT COUNT(*) AS cnt FROM users WHERE email= ?",
      [args.email],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }
        if (results[0].cnt == 0) {
          return res.status(403).json({
            message: "User does not exists, Contact Admin !",
          });
        } else {
          db.run(
            `update users set password=? where email=?`,
            [data.password, data.email],
            (error, results, fields) => {
              if (error) {
                return res.status(500).json({
                  message: error.message,
                });
              } else {
                return res.status(200).json({
                  message: "Password updated successfully",
                });
              }
            }
          );
        }
      }
    );
  },
  getUserByUserId: (req, res) => {
    const id = req.params.id;
    getUserByUserId(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Record not Found",
        });
      }
      results.password = undefined;
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
  getUsers: (req, res) => {
    getUsers((err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.json({
        success: 1,
        data: results,
      });
    });
  },
  updateUsers: (req, res) => {
    const body = req.body;
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);
    updateUser(body, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.json({
        success: 1,
        message: "updated successfully",
      });
    });
  },
  deleteUser: (req, res) => {
    const data = req.body;
    deleteUser(data, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Record Not Found",
        });
      }
      return res.json({
        success: 1,
        message: "user deleted successfully",
      });
    });
  },
};
