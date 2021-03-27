const pool = require("../config/database");
const NodeTable = require("../services/nodetable");
const NodeTableSqlite = require("../services/nodetable_sqlite");
const db = require("../services/sqliteConfig");

const {
  create,
  update,
  updateInsert,
  createItemInvoice,
  updateInvoice,
} = require("../services/invoices");
function padLeadingZeros(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}
module.exports = {
  getInvoiceNumber: (req, res) => {
    db.get(
      `SELECT MAX(Inv_Suffix) AS Invoice_Number FROM invoices;`,
      [],
      (err, data) => {
        if (err) {
          return res.status(403).json({
            error: err,
          });
        }
        if (data.Invoice_Number) {
          let number = padLeadingZeros(data.Invoice_Number + 1, 5);
          let date = new Date();
          let Invoice_Number = `CC${date.getFullYear()}${date.getMonth() + 1
            }-${number}`;
          return res.status(200).json({
            data: Invoice_Number,
          });
        } else {
          let date = new Date();
          let Invoice_Number = `CC${date.getFullYear()}${date.getMonth() + 1
            }-00001`;
          return res.status(200).json({
            data: Invoice_Number,
          });
        }
      }
    );
  },
  createInvoice: (req, res) => {
    const body = req.body;
    console.log(body);
    const reg = {
      Invoice_Number: body.Invoice_Number,
    };

    pool.query(
      "SELECT COUNT(*) AS cnt FROM invoices WHERE Invoice_Number = ? ",
      [reg.Invoice_Number],
      (err, data) => {
        if (err) {
          return res.status(403).json({
            error: err,
          });
        }
        if (data[0].cnt > 0) {
          return res.status(403).json({
            message: "Invoice already exists !",
          });
        }

        create(body, (err, results) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              success: 0,
              message: "Database connection error !",
            });
          }
          return res.status(200).json({
            message: "Invoice saved successfully !",
            data: results,
          });
        });
      }
    );
  },

  insertInvoiceItems: (req, res) => {
    const body = req.body;
    let Invoice_Number = body.Invoice_Number;
    db.all(
      "SELECT COUNT(*) AS cnt FROM invoices WHERE Invoice_Number = ? ",
      [Invoice_Number],
      (err, data) => {
        console.log(data);
        if (err) {
          return res.status(403).json({
            error: err,
          });
        }
        if (data[0].cnt > 0) {
          return res.status(403).json({
            message: "Invoice already exists !",
          });
        }

        createItemInvoice(body, (err, results) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              success: 0,
              message: "Database connection error !",
            });
          }
          return res.status(200).json({
            message: "Invoice saved successfully !",
            data: results,
          });
        });
      }
    );
  },
  updateInvoiceItems: (req, res) => {
    const body = req.body;
    console.log(body);

    updateInvoice(body, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Database connection error !",
        });
      }
      return res.status(200).json({
        message: "Invoice updated !",
        data: results,
      });
    });
  },

  updateInvoice: (req, res) => {
    const body = req.body;
    console.log(body);

    const reg = {
      Invoice_Number: body.Invoice_Number,
      EntryType: body.Invoice_Type,
    };
    console.log(reg.Invoice_Number);
    console.log(reg.EntryType);

    pool.query(
      "SELECT COUNT(*) AS cnt FROM payments WHERE Invoice_Number = ? and EntryType=?",
      [reg.Invoice_Number, reg.EntryType],
      (err, data) => {
        console.log(data);
        if (err) {
          return res.status(403).json({
            error: err,
          });
        }
        if (data[0].cnt > 0) {
          console.log(`update`);
          update(body, (err, results) => {
            if (err) {
              return res.status(500).json({
                success: 0,
                message: "Database connection error !",
              });
            }
            return res.status(200).json({
              message: "Invoice updated successfully !",
              data: results,
            });
          });
        } else {
          updateInsert(body, (err, results) => {
            console.log(`updateInsert`);
            if (err) {
              return res.status(500).json({
                success: 0,
                message: "Database connection error !",
              });
            }
            return res.status(200).json({
              message: "Invoice updated successfully !",
              data: results,
            });
          });
        }
      }
    );
  },

  //   getInvoices: (req, res) => {
  //     pool.query(
  //       `SELECT i.Invoice_Id,i.Invoice_Number,i.Invoice_Date,i.Total_Payable_Amt,c.first_name as Agent_Name FROM customers c, invoices i where i.Agent_Name =concat(c.Prefix,c.id)`,
  //       [],
  //       (error, results, fields) => {
  //         if (error) {
  //           return res.status(403).json({
  //             error: error,
  //             message: "Error : Invoice List",
  //           });
  //         } else {
  //           return res.status(200).json({
  //             message: "success",
  //             data: results,
  //           });
  //         }
  //       },
  //     );
  //   },

  findInvoiceRecords: (req, res) => {
    const query =
      "SELECT i.Invoice_Id,i.Invoice_Number,i.Invoice_Date,c.first_name as Agent_Name FROM customers c, invoice i where i.Customer_Id =(c.Prefix || c.id)";
    db.all(query, [], (err, data) => {
      if (err) {
        return res.status(403).json({
          error: err,
        });
      }
      return res.status(200).json({ data: data });
    });
  },

  fetchInvoiceList: (req, res, next) => {
    const requestQuery = req.query;

    const query =
      "SELECT i.Invoice_Id,i.Invoice_Number,i.Invoice_Date,i.Base_Amount, i.TOTAL_GST_Amount,i.TOTAL_Amount,c.first_name as Agent_Name FROM customers c, invoices i where i.Customer_Id =(c.Prefix || c.id)";

    let columnsMap = [
      {
        db: "Invoice_Id",
        dt: 0,
      },
      {
        db: "Invoice_Number",
        dt: 1,
      },
      {
        db: "Invoice_Date",
        dt: 2,
      },
      {
        db: "Agent_Name",
        dt: 3,
      },
      {
        db: "Base_Amount",
        dt: 4,
      },
      {
        db: "TOTAL_GST_Amount",
        dt: 5,
      },
      {
        db: "TOTAL_Amount",
        dt: 6,
      },
    ];

    // NodeTable requires table's primary key to work properly
    const primaryKey = "Invoice_Id";

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
  getCustomers: (req, res) => {
    fetchCustomers((err, results) => {
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

  getInvoiceByID: (req, res) => {
    const invoiceId = req.params.id;

    db.get(
      `SELECT * from invoices where Invoice_Number=?`,
      [invoiceId],
      (error, results) => {
        if (error) {
          return res.status(403).json({
            error: error,
            message: "Error : Invoice Update",
          });
        } else {
          return res.status(200).json({
            message: "Success",
            data: results,
          });
        }
      }
    );
  },

  getCustomerById: (req, res) => {
    console.log(`object`);
    const id = req.params.id;
    fetchCustomerById(id, (err, results) => {
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

      return res.json({
        success: 1,
        data: results,
      });
    });
  },

  updateCustomer: (req, res) => {
    const body = req.body;
    setCustomer(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(403).json({
          message: "Database connection error !",
        });
      }
      return res.status(200).json({
        success: 1,
        message: "updated successfully !",
      });
    });
  },

  login: (req, res) => {
    const body = req.body;
    getUserByUserEmail(body.email, (err, results) => {
      if (err) {
        console.log(err);
      }
      if (!results) {
        return res.json({
          success: 0,
          data: "Password || Email doesn't match !",
        });
      }
      const result = compareSync(body.password, results.password);
      if (result) {
        results.password = undefined;
        const jsontoken = sign({ result: results }, "neosoft@1234", {
          expiresIn: "1h",
        });
        return res.json({
          success: 1,
          message: "login successfully",
          token: jsontoken,
        });
      } else {
        return res.json({
          success: 0,
          data: "Password || Email doest match !",
        });
      }
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
