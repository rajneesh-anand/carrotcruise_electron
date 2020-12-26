const pool = require("../config/database");

exports.generatePdf = (req, res) => {
  const Invoice_Number = req.params.id;
  pool.query(
    "SELECT i.Invoice_Number,i.Invoice_Type,i.Invoice_Date,i.Departure_Date,i.Currency,i.Cruise_Ship,i.Cruise,i.Booking,i.Cabin,i.Cat_Bkg,i.Pass_Name,i.Base_Amt,i.TDS_Amt,i.ROE,i.PAX,i.Comm_Amt,i.NCF_Amt,i.TAX_Amt,i.HS_Amt,i.Grat_Amt,i.Misc,i.GST_Amt,i.CGST,i.SGST,i.IGST,i.Token_Amt,i.Total_Payable_Amt,i.Total_Payable_Amt_INR,i.GST,i.Token_Amt_INR,c.first_name,c.address_line_one,c.city,c.gstin,c.pincode,s.State_Name from invoices i, customers c, states s where Invoice_Number =? and i.Agent_Name =concat(c.Prefix,c.id) and c.state =s.id",
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
