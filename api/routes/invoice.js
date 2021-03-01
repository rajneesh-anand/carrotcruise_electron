const router = require("express").Router();
const { checkToken } = require("../auth/jwt_validation");
const {
  createInvoice,
  getInvoiceNumber,
  getInvoices,
  updateInvoice,
  getInvoiceByID,
  findInvoiceRecords,
  insertInvoiceItems,
  updateInvoiceItems,
} = require("../controllers/invoices");
// router.get("/invoices", getInvoices);
router.post("/invoice", createInvoice);
router.put("/invoice", updateInvoice);
router.post("/invoiceitems", insertInvoiceItems);
router.put("/invoiceitems", updateInvoiceItems);

router.get("/getinvoice", getInvoiceNumber);
router.get("/getinvoices", findInvoiceRecords);
router.get("/invoice/:id", getInvoiceByID);
router.get("/invoicelist", getInvoices);

// router.get("/invoice/:id", getInvoiceById);
// router.put("/invoice", updateInvoice);

module.exports = router;
