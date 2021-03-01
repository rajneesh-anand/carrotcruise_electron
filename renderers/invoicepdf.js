const printInvoiceAPICall = (id) => {
  return axios
    .get(`http://localhost:3000/api/generatepdf/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
};

function printInvoicePdf(invoice_id) {
  printInvoiceAPICall(invoice_id).then(async (result) => {
    if (result.message === "success") {
      let invResults = result.data[0];
      console.log(invResults);
      let gst_rate =
        invResults.CGST_Rate + invResults.IGST_Rate + invResults.SGST_Rate;
      let currencyCode = "&#x20B9;";
      // switch (currencyCode) {
      //   case 1:
      //     currencyCode = "AED";
      //     break;
      //   case 2:
      //     currencyCode = "&#x20AC;";
      //     break;

      //   case 3:
      //     currencyCode = "&#xa3;";
      //     break;

      //   case 4:
      //     currencyCode = "&#x20B9;";
      //     break;

      //   case 5:
      //     currencyCode = "&#x24;";
      //     break;
      // }

      // let net_amount =
      //   invResults.Base_Amt +
      //   invResults.NCF_Amt +
      //   invResults.TAX_Amt +
      //   invResults.HS_Amt +
      //   invResults.Grat_Amt +
      //   invResults.Misc +
      //   invResults.TDS_Amt -
      //   invResults.Comm_Amt;

      // let CGST_AMT =
      //   invResults.Invoice_Type === "Token Invoice"
      //     ? ((invResults.Token_Amt * invResults.CGST) / 100).toFixed(2)
      //     : ((net_amount * invResults.CGST) / 100).toFixed(2);
      // let SGST_AMT =
      //   invResults.Invoice_Type === "Token Invoice"
      //     ? ((invResults.Token_Amt * invResults.SGST) / 100).toFixed(2)
      //     : ((net_amount * invResults.SGST) / 100).toFixed(2);

      const data = {
        Invoice_Number: invResults.Invoice_Number,
        Invoice_Date: invResults.Invoice_Date,
        InvoiceItems: JSON.parse(invResults.Invoice_Items),
        BaseAmount: invResults.Base_Amount.toFixed(2),
        TotalAmount: invResults.TOTAL_Amount.toFixed(2),
        CGST: invResults.CGST_Rate === 0 ? false : invResults.CGST_Rate,
        SGST: invResults.SGST_Rate === 0 ? false : invResults.SGST_Rate,
        CGSTAmt:
          invResults.CGST_Amount === 0
            ? false
            : invResults.CGST_Amount.toFixed(2),
        SGSTAmt:
          invResults.SGST_Amount === 0
            ? false
            : invResults.SGST_Amount.toFixed(2),
        GST_Amt:
          invResults.TOTAL_GST_Amount === 0
            ? false
            : invResults.TOTAL_GST_Amount.toFixed(2),

        GSTRate: gst_rate === 0 ? false : gst_rate,
        first_name: invResults.first_name,
        address: invResults.address_line_one,
        city: invResults.city,
        state: invResults.State_Name,
        gstin: invResults.gstin,
        pincode: invResults.pincode,
        currency: currencyCode,
      };

      console.log(data);

      // let templateHtml = fs.readFileSync(
      //   path.join(app.getAppPath(), "../build/invoicetemplate.html"),
      //   "utf8"
      // );

      let templateHtml = fs.readFileSync(
        path.join(__dirname, "../build/invoicetemplate.html"),
        "utf8"
      );

      let template = handlebars.compile(templateHtml);
      let html = template(data);

      const pdfPath = `C://PDF_REPORTS//${data.Invoice_Number}.pdf`;

      let options = {
        printBackground: true,
        path: pdfPath,
        format: "A4",
      };

      const browser = await puppeteer.launch({
        headless: true,
        // executablePath: path.join(
        //   app.getAppPath(),
        //   "../app.asar.unpacked/node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
        // ),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      let page = await browser.newPage();
      await page.setContent(html);

      await page.pdf(options);
      await browser.close();

      alert("INVOICE GENERATED SUCCESSFULLY");
    }
  });
}
