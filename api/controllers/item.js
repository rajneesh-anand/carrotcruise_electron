const NodeTableSqlite = require("../services/nodetable_sqlite");
const path = require("path");
const fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
const db_path = path.join(__dirname, "../../neodb.db");

var db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to database successfully");
});

module.exports = {
  createItem: (req, res, next) => {
    console.log(req.body);
    try {
      const data = req.body;
      db.run(
        `INSERT INTO item(Item_Name,Gst_Rate,Unit_Price) VALUES(?,?,?)`,
        [data.name, data.gst_rate, data.unit_price],
        function (err) {
          if (err) {
            console.log(err.message);
            res.send({ message: err.message });
          } else {
            res.send({ message: "Item Saved !" });
          }
        }
      );
    } catch (err) {
      console.log(err);
    } finally {
      db.close();
    }
  },

  fetchItems: (req, res) => {
    const requestQuery = req.query;

    let columnsMap = [
      {
        db: "Id",
        dt: 0,
      },
      {
        db: "Item_Name",
        dt: 1,
      },
      {
        db: "Unit_Price",
        dt: 2,
      },
      {
        db: "Gst_Rate",
        dt: 3,
      },
    ];

    // Custome SQL query
    const query = "SELECT Id, Item_Name, Unit_Price,Gst_Rate FROM item";
    // NodeTable requires table's primary key to work properly
    const primaryKey = "Id";

    const nodeTable = new NodeTableSqlite(
      requestQuery,
      query,
      primaryKey,
      columnsMap
    );

    nodeTable.output((err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      // Directly send this data as output to Datatable
      res.send(data);
    });
  },

  fetchItemById: (req, res, next) => {
    const id = req.params.id;
    let sql = `SELECT * from item WHERE Id  = ?`;
    db.get(sql, [id], (err, row) => {
      if (err) {
        return console.error(err.message);
      } else {
        return res.json({
          success: 1,
          data: row,
        });
      }
    });
  },

  fetchItemNames: (req, res, next) => {
    const id = req.params.id;
    let sql = `SELECT Item_Name from item ORDER BY Item_Name ASC`;
    db.all(sql, [], (err, row) => {
      if (err) {
        return res.json({
          message: err.message,
        });
      } else {
        return res.json({
          success: 1,
          data: row,
        });
      }
    });
  },

  updateItem: (req, res, next) => {
    const data = req.body;
    console.log(data);
    let sql = `UPDATE item SET Item_Name = ?,Gst_Rate=?,Unit_Price=? WHERE Id = ?`;
    db.get(
      sql,
      [data.name, data.gst_rate, data.unit_price, data.id],
      (err, row) => {
        if (err) {
          return res.json({
            message: err.message,
          });
        } else {
          return res.json({
            message: "Item updated !",
          });
        }
      }
    );
  },
};
