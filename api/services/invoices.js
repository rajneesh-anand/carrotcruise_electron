const pool = require("../config/database");

module.exports = {
  create: (data, callBack) => {
    const insertIntoInvoiceAndAccounts = `insert into invoices(Invoice_Number,Invoice_Type,Invoice_Date,Departure_Date,Agent_Name,Cruise_Ship,Cruise,Currency,Booking,Cabin,Cat_Bkg,Pass_Name,Nationality,Adults,Children,Infants,Adults_Rate,Children_Rate,Infants_Rate,
            Comm_Rate,Comm_Amt,NCF,NCF_Amt,TAX,TAX_Amt,Grat,Grat_Amt,HS,HS_Amt,Misc,TDS,TDS_Amt,Token_Amt,CGST,IGST,SGST,GST_Amt,ROE, Base_Amt,Total_Payable_Amt,Total_Payable_Amt_INR,Token,GST,PAX,Token_Amt_INR)
           
            values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?); 
            insert into payments(EntryDate,Credit_Account,Credit_Amount,Debit_Account,Debit_Amount,EntryType,Invoice_Number,Comments)values(?,?,?,?,?,?,?,?)`;

    pool.query(
      insertIntoInvoiceAndAccounts,
      [
        data.Invoice_Number,
        data.Invoice_Type,
        data.Invoice_Date,
        data.Departure_Date,
        data.Agent_Name,
        data.Cruise_Ship,
        data.Cruise,
        data.Currency,
        data.Booking,
        data.Cabin,
        data.Cat_Bkg,
        data.Pass_Name,
        data.Nationality,
        data.Adults,
        data.Children,
        data.Infants,
        data.Adults_Rate,
        data.Children_Rate,
        data.Infants_Rate,
        data.Comm_Rate,
        data.Comm_Amt,
        data.NCF,
        data.NCF_Amt,
        data.TAX,
        data.TAX_Amt,
        data.Grat,
        data.Grat_Amt,
        data.HS,
        data.HS_Amt,
        data.Misc,
        data.TDS,
        data.TDS_Amt,
        data.Token_Amt,
        data.CGST,
        data.IGST,
        data.SGST,
        data.GST_Amt,
        data.ROE,
        data.Base_Amt,
        data.Total_Payable_Amt,
        data.Total_Payable_Amt_INR,
        data.Token,
        data.GST,
        data.PAX,
        data.Token_Amt_INR,
        data.EntryDate,
        data.Credit_Account,
        data.Credit_Amount,
        data.Debit_Account,
        data.Debit_Amount,
        data.EntryType,
        data.InvoiceNumber,
        data.Comments,
      ],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  createItemInvoice: (data, callback) => {
    const sql = `INSERT INTO invoice(Invoice_Number,Invoice_Date,Customer_Id,Base_Amount,CGST_Rate,SGST_Rate,IGST_Rate,CGST_Amount,SGST_Amount,IGST_Amount,TOTAL_GST_Amount,TOTAL_Amount)     
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?);    
      INSERT INTO payments(EntryDate,Credit_Account,Credit_Amount,Debit_Account,Debit_Amount,EntryType,Invoice_Number,Comments)
      VALUES(?,?,?,?,?,?,?,?);
      INSERT INTO invoice_items (particulars, quantity, rate, amount, invoice_number) VALUES ?`;

    pool.query(
      sql,
      [
        data.Invoice_Number,
        data.Invoice_Date,
        data.Agent_Name,
        data.Base_Amount,
        data.Cgst_Rate,
        data.Sgst_Rate,
        data.Igst_Rate,
        data.Cgst_Amount,
        data.Sgst_Amount,
        data.Igst_Amount,
        data.TotalGst_Amount,
        data.Total_Amount,
        data.Invoice_Date,
        data.Credit_Account,
        data.Credit_Amount,
        data.Debit_Account,
        data.Debit_Amount,
        data.EntryType,
        data.InvoiceNumber,
        data.Comments,
        data.InvoiceItems,
      ],
      (error, results, fields) => {
        if (error) {
          callback(error);
        }
        return callback(null, results);
      }
    );
  },

  update: (data, callBack) => {
    const updateIntoInvoiceAndAccounts = `update invoices set Invoice_Type=?,Invoice_Date=?, Departure_Date=?, Agent_Name=?, Cruise_Ship=?, Cruise=?, Currency=?, Booking=?, Cabin=?, Cat_Bkg=?, Pass_Name=?, Nationality=?, Adults=?, Children=?, Infants=?, Adults_Rate=?, Children_Rate=?, Infants_Rate=?, 
            Comm_Rate=?, Comm_Amt=?, NCF=?, NCF_Amt=?, TAX=?,TAX_Amt=?,Grat=?,Grat_Amt=?,HS=?,HS_Amt=?,Misc=?,TDS=?,TDS_Amt=?,Token_Amt=?,Token_Amt_INR=?,CGST=?,IGST=?,SGST=?,GST_Amt=?,ROE=?, Base_Amt=?,Total_Payable_Amt=?,Total_Payable_Amt_INR=?,Token=?,GST=?,PAX=? where Invoice_Number=?;             
           update payments set EntryDate=?,Credit_Account=?,Credit_Amount=?,Debit_Account=?,Debit_Amount=?,Comments=? where Invoice_Number =? and EntryType=?`;
    console.log(updateIntoInvoiceAndAccounts);
    pool.query(
      updateIntoInvoiceAndAccounts,
      [
        data.Invoice_Type,
        data.Invoice_Date,
        data.Departure_Date,
        data.Agent_Name,
        data.Cruise_Ship,
        data.Cruise,
        data.Currency,
        data.Booking,
        data.Cabin,
        data.Cat_Bkg,
        data.Pass_Name,
        data.Nationality,
        data.Adults,
        data.Children,
        data.Infants,
        data.Adults_Rate,
        data.Children_Rate,
        data.Infants_Rate,
        data.Comm_Rate,
        data.Comm_Amt,
        data.NCF,
        data.NCF_Amt,
        data.TAX,
        data.TAX_Amt,
        data.Grat,
        data.Grat_Amt,
        data.HS,
        data.HS_Amt,
        data.Misc,
        data.TDS,
        data.TDS_Amt,
        data.Token_Amt,
        data.Token_Amt_INR,
        data.CGST,
        data.IGST,
        data.SGST,
        data.GST_Amt,
        data.ROE,
        data.Base_Amt,
        data.Total_Payable_Amt,
        data.Total_Payable_Amt_INR,
        data.Token,
        data.GST,
        data.PAX,
        data.Invoice_Number,
        data.EntryDate,
        data.Credit_Account,
        data.Credit_Amount,
        data.Debit_Account,
        data.Debit_Amount,
        data.Comments,
        data.InvoiceNumber,
        data.EntryType,
      ],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  updateInsert: (data, callBack) => {
    const updateInsertIntoInvoiceAndAccounts = `update invoices set Invoice_Type=?,Invoice_Date=?, Departure_Date=?, Agent_Name=?, Cruise_Ship=?, Cruise=?, Currency=?, Booking=?, Cabin=?, Cat_Bkg=?, Pass_Name=?, Nationality=?, Adults=?, Children=?, Infants=?, Adults_Rate=?, Children_Rate=?, Infants_Rate=?, 
            Comm_Rate=?, Comm_Amt=?, NCF=?, NCF_Amt=?, TAX=?,TAX_Amt=?,Grat=?,Grat_Amt=?,HS=?,HS_Amt=?,Misc=?,TDS=?,TDS_Amt=?,Token_Amt=?,Token_Amt_INR=?,CGST=?,IGST=?,SGST=?,GST_Amt=?,ROE=?, Base_Amt=?,Total_Payable_Amt=?,Total_Payable_Amt_INR=?,Token=?,GST=?,PAX=? where Invoice_Number=?;             
            insert into payments(EntryDate,Credit_Account,Credit_Amount,Debit_Account,Debit_Amount,EntryType,Invoice_Number,Comments)values(?,?,?,?,?,?,?,?)`;
    console.log(updateInsertIntoInvoiceAndAccounts);
    pool.query(
      updateInsertIntoInvoiceAndAccounts,
      [
        data.Invoice_Type,
        data.Invoice_Date,
        data.Departure_Date,
        data.Agent_Name,
        data.Cruise_Ship,
        data.Cruise,
        data.Currency,
        data.Booking,
        data.Cabin,
        data.Cat_Bkg,
        data.Pass_Name,
        data.Nationality,
        data.Adults,
        data.Children,
        data.Infants,
        data.Adults_Rate,
        data.Children_Rate,
        data.Infants_Rate,
        data.Comm_Rate,
        data.Comm_Amt,
        data.NCF,
        data.NCF_Amt,
        data.TAX,
        data.TAX_Amt,
        data.Grat,
        data.Grat_Amt,
        data.HS,
        data.HS_Amt,
        data.Misc,
        data.TDS,
        data.TDS_Amt,
        data.Token_Amt,
        data.Token_Amt_INR,
        data.CGST,
        data.IGST,
        data.SGST,
        data.GST_Amt,
        data.ROE,
        data.Base_Amt,
        data.Total_Payable_Amt,
        data.Total_Payable_Amt_INR,
        data.Token,
        data.GST,
        data.PAX,
        data.Invoice_Number,
        data.EntryDate,
        data.Credit_Account,
        data.Credit_Amount,
        data.Debit_Account,
        data.Debit_Amount,
        data.EntryType,
        data.InvoiceNumber,
        data.Comments,
      ],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getUserByUserEmail: (email, callBack) => {
    pool.query(
      `select * from registration where email = ?`,
      [email],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  fetchCustomerById: (id, callBack) => {
    pool.query(
      `select * from customers where id = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  fetchCustomers: (callBack) => {
    pool.query(`SELECT * FROM customers`, [], (error, results, fields) => {
      if (error) {
        callBack(error);
      }
      return callBack(null, results);
    });
  },
  setCustomer: (data, callBack) => {
    pool.query(
      `update customers set first_name=?, last_name=?, address_line_one=?, email=?, address_line_two=?, mobile=?, phone=?, state=?, gstin=?, city=? where id = ?`,
      [
        data.first_name,
        data.last_name,
        data.address_line_one,
        data.email,
        data.address_line_two,
        data.mobile,
        data.phone,
        data.state,
        data.gstin,
        data.city,
        data.id,
      ],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  deleteUser: (data, callBack) => {
    pool.query(
      `delete from registration where id = ?`,
      [data.id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
};
