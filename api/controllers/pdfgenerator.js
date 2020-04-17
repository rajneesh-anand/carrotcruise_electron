const pool = require("../config/database");

exports.generatePdf = (req, res) => {
	const Invoice_Id = req.params.id;
	pool.query(
		"SELECT i.Invoice_Number,i.Invoice_Date,i.Departure_Date,i.Currency,i.Cruise_Ship,i.Cruise,i.Booking,i.Cabin,i.Cat_Bkg,i.Pass_Name,i.Base_Amt,i.TDS_Amt,i.ROE,i.PAX,i.Comm_Amt,i.NCF_Amt,i.TAX_Amt,i.HS_Amt,i.Grat_Amt,i.Misc,i.GST_Amt,i.CGST,i.SGST,i.IGST,i.Token_Amt,i.Total_Payable_Amt,i.Total_Payable_Amt_INR,i.GST,c.first_name,c.address_line_one,c.city,c.gstin,c.pincode,s.State_Name from invoices i, customers c, states s where Invoice_Id =? and i.Agent_Name =c.id and c.state =s.id",
		[Invoice_Id],
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
		[id, id, id],
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
