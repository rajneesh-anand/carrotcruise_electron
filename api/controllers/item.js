const NodeTableSqlite = require("../services/nodetable_sqlite");
const db = require("../services/sqliteConfig");

module.exports = {
  createItem: (req, res, next) => {
    console.log(req.body);
    try {
      const data = req.body;
      db.run(
        `INSERT INTO items(Item_Name,Gst_Rate,Unit_Price) VALUES(?,?,?)`,
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
        db: "id",
        dt: 0,
      },
      {
        db: "Item_Name",
        dt: 1,
      },
      {
        db: "HSN_Code",
        dt: 2,
      },
      {
        db: "Unit_Price",
        dt: 3,
      },
      {
        db: "Gst_Rate",
        dt: 4,
      },
    ];

    // Custome SQL query
    const query =
      "SELECT id, Item_Name,HSN_Code, Unit_Price,Gst_Rate FROM items";
    // NodeTable requires table's primary key to work properly
    const primaryKey = "id";

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
      res.send(data);
    });
  },

  fetchItemById: (req, res, next) => {
    const id = req.params.id;
    let sql = `SELECT * from items WHERE id  = ?`;
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
    let sql = `SELECT Item_Name,HSN_Code,Gst_Rate from items ORDER BY Item_Name ASC`;
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
    let sql = `UPDATE items SET Item_Name = ?,HSN_Code=?,Gst_Rate=?,Unit_Price=? WHERE id = ?`;
    db.get(
      sql,
      [data.name, data.hsn_code, data.gst_rate, data.unit_price, data.id],
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
