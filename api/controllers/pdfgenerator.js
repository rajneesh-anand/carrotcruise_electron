const pool = require("../config/database");

exports.generatePdf = (req, res) => {
  const Invoice_Number = req.params.id;
  pool.query(
    "SELECT i.Invoice_Number,i.Invoice_Date,i.Base_Amount,i.IGST_Rate,i.CGST_Rate,i.SGST_Rate,i.IGST_Amount,i.CGST_Amount,i.SGST_Amount,i.TOTAL_GST_Amount,i.TOTAL_Amount,i.Invoice_Items,c.first_name,c.address_line_one,c.city,c.gstin,c.pincode,s.State_Name from invoice i, customers c, states s where Invoice_Number =? and i.Customer_Id =concat(c.Prefix,c.id) and c.state =s.id",
    [Invoice_Number],
    (error, results) => {
      if (error) {
        return res.status(403).json({
          error: error,
          message: `Error : ${error}`,
        });
      } else {
        return res.status(200).json({
          message: "success",
          data: results,
        });
      }
    }
  );
};
exports.generateAllLedgerPdfDatewise = (req, res) => {
  pool.query(
    `select t.Acc,SUM(IFNULL( t.Credit, 0 )) AS Credit,SUM(IFNULL( t.Debit, 0 )) AS Debit, c.first_name,c.city from (
				select Credit_Account AS Acc,  Credit_Amount AS Credit, NULL as Debit from receive
				union
				select Debit_Account AS Acc , NULL as Credit, Debit_Amount AS Debit from payments ) as t, customers c where t.Acc = concat(c.Prefix,c.id) Group by t.Acc`,
    [],
    (error, results) => {
      if (error) {
        return res.status(403).json({
          error: error,
          message: `Error : ${error}`,
        });
      } else {
        return res.status(200).json({
          message: "success",
          data: results,
        });
      }
    }
  );
};

exports.generateLedgerPdf = (req, res) => {
  const id = req.params.id;
  pool.query(
    `SELECT c.first_name,c.address_line_one,c.city,c.gstin,c.pincode,s.State_Name from customers c, states s where c.id = ? and c.state =s.id; SELECT EntryDate as EntryDate, EntryType, Comments,Invoice_Number, Debit_Amount as Debit, NULL as Credit FROM payments where Debit_Account =?
        UNION ALL 
        SELECT EntryDate as EntryDate,EntryType,Comments,Invoice_Number,  NULL as Debit,Credit_Amount as Credit FROM receive where Credit_Account =?
        ORDER BY EntryDate`,
    [id.slice(-1), id, id],
    (error, results) => {
      if (error) {
        return res.status(403).json({
          error: error,
          message: `Error : ${error}`,
        });
      } else {
        return res.status(200).json({
          message: "success",
          data: results,
        });
      }
    }
  );
};

exports.generateLedgerPdfDateWise = (req, res) => {
  const id = req.params.id;
  const args = req.body;
  const sql = `SELECT c.first_name,c.address_line_one,c.city,c.gstin,c.pincode,s.State_Name from customers c, states s where c.id = ? and c.state =s.id; SELECT EntryDate as EntryDate, EntryType, Comments,Invoice_Number, Debit_Amount as Debit, NULL as Credit FROM payments where Debit_Account =? and EntryDate between ? and ?
  UNION ALL 
  SELECT EntryDate as EntryDate,EntryType,Comments,Invoice_Number,  NULL as Debit,Credit_Amount as Credit FROM receive where Credit_Account =? and EntryDate between ? and ?
  ORDER BY EntryDate`;
  console.log(sql);
  pool.query(
    sql,
    [id.slice(-1), id, args.from, args.to, id, args.from, args.to],
    (error, results) => {
      if (error) {
        return res.status(403).json({
          error: error,
          message: `Error : ${error}`,
        });
      } else {
        return res.status(200).json({
          message: "success",
          data: results,
        });
      }
    }
  );
};
