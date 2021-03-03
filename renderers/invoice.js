const electron = require("electron");
const remote = electron.remote;
const { ipcRenderer } = electron;
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");

var x,
  gstSwitchStatus = true,
  val1,
  val2,
  val3,
  val4,
  val5,
  val6,
  val7,
  val8,
  val9,
  val10,
  val11,
  val12,
  val13,
  val14,
  val15,
  val16,
  val17,
  val18,
  total,
  comm_amount,
  total_passenger,
  base_amount,
  ncf_amount,
  tax_amount,
  hs_amount,
  gratuity_amount,
  misc_amount,
  token_amount,
  token_amount_inr,
  tds_amount,
  cgst_amount,
  sgst_amount,
  igst_amount,
  gst,
  total_gst,
  gross_amount,
  gross_amount_inr;

var customers = [];

ipcRenderer.on("invoice:added", (event, args) => {
  alert(args);
});

handlebars.registerHelper("ifEqual", function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper("formatDate", function (dateString) {
  let event = new Date(`${dateString}`);
  let month = event.getMonth();
  let date = event.getDate();
  let year = event.getFullYear();

  switch (month) {
    case 0:
      month = "Jan";
      break;
    case 1:
      month = "Feb";
      break;
    case 2:
      month = "Mar";
      break;
    case 3:
      month = "Apr";
      break;
    case 4:
      month = "May";
      break;
    case 5:
      month = "Jun";
      break;
    case 6:
      month = "Jul";
      break;

    case 7:
      month = "Aug";
      break;
    case 8:
      month = "Sep";
      break;
    case 9:
      month = "Oct";
      break;
    case 10:
      month = "Nov";
      break;
    case 11:
      month = "Dec";
      break;
  }
  return `${date} ${month} ${year}`;
});

function ValidateNumbers(e) {
  document.oncontextmenu = function () {
    return false;
  };
  var key = document.all ? e.keyCode : e.which;
  if (key == 8) return true;
  patron = /\d/;
  te = String.fromCharCode(key);
  return patron.test(te);
}

function isNumberKey(evt, obj) {
  var charCode = evt.which ? evt.which : event.keyCode;
  var value = obj.value;
  var dotcontains = value.indexOf(".") != -1;
  if (dotcontains) if (charCode == 46) return false;
  if (charCode == 46) return true;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
  return true;
}

function thFormat(num) {
  var num_parts = num.toString().split(".");
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return num_parts.join(".");
}

function GetTotal(obj) {
  x = document.getElementById("invoiceType").options[
    document.getElementById("invoiceType").selectedIndex
  ].text;

  val1 =
    document.getElementById("adults").value === ""
      ? 0
      : document.getElementById("adults").value;
  val2 =
    document.getElementById("children").value === ""
      ? 0
      : document.getElementById("children").value;
  val3 =
    document.getElementById("infants").value === ""
      ? 0
      : document.getElementById("infants").value;
  val4 =
    document.getElementById("price_adults").value === ""
      ? 0
      : document.getElementById("price_adults").value;
  val5 =
    document.getElementById("price_children").value === ""
      ? 0
      : document.getElementById("price_children").value;
  val6 =
    document.getElementById("price_infants").value === ""
      ? 0
      : document.getElementById("price_infants").value;
  val7 = document.getElementById("comm").value
    ? document.getElementById("comm").value
    : 0;
  val8 =
    document.getElementById("ncf").value === ""
      ? 0
      : document.getElementById("ncf").value;
  val9 =
    document.getElementById("tax").value === ""
      ? 0
      : document.getElementById("tax").value;
  val10 =
    document.getElementById("gratuity").value === ""
      ? 0
      : document.getElementById("gratuity").value;
  val11 =
    document.getElementById("holiday").value === ""
      ? 0
      : document.getElementById("holiday").value;
  val12 =
    document.getElementById("misc").value === ""
      ? 0
      : document.getElementById("misc").value;
  val13 =
    document.getElementById("tds").value === ""
      ? 0
      : document.getElementById("tds").value;
  val14 =
    document.getElementById("token").value === ""
      ? 0
      : document.getElementById("token").value;
  val15 = document.getElementById("cgst").value
    ? document.getElementById("cgst").value
    : 0;
  val16 = document.getElementById("igst").value
    ? document.getElementById("igst").value
    : 0;
  val17 = document.getElementById("sgst").value
    ? document.getElementById("sgst").value
    : 0;
  val18 = document.getElementById("roe").value
    ? document.getElementById("roe").value
    : 1;

  total_passenger = parseInt(val1) + parseInt(val2) + parseInt(val3);

  var amount_one = parseInt(val1) * parseFloat(val4);
  var amount_two = parseInt(val2) * parseFloat(val5);
  var amount_three = parseInt(val3) * parseFloat(val6);

  total = (
    parseFloat(amount_one) +
    parseFloat(amount_two) +
    parseFloat(amount_three)
  ).toFixed(2);

  comm_amount = ((total * parseFloat(val7)) / 100).toFixed(2);

  base_amount = parseFloat(total) - parseFloat(comm_amount);

  ncf_amount = (parseInt(total_passenger) * parseFloat(val8)).toFixed(2);
  tax_amount = (parseInt(total_passenger) * parseFloat(val9)).toFixed(2);
  gratuity_amount = (parseInt(total_passenger) * parseFloat(val10)).toFixed(2);
  hs_amount = (parseInt(total_passenger) * parseFloat(val11)).toFixed(2);
  misc_amount = parseFloat(val12).toFixed(2);
  tds_amount = ((comm_amount * parseFloat(val13)) / 100).toFixed(2);
  token_amount = parseFloat(val14).toFixed(2);

  net_amount = (
    parseFloat(base_amount) +
    parseFloat(ncf_amount) +
    parseFloat(tax_amount) +
    parseFloat(gratuity_amount) +
    parseFloat(hs_amount) +
    parseFloat(misc_amount) +
    parseFloat(tds_amount)
  ).toFixed(2);

  // GST Calculation
  gst = parseFloat(val15) + parseFloat(val16) + parseFloat(val17);
  cgst_amount =
    x === "TOKEN"
      ? ((token_amount * parseFloat(val15)) / 100).toFixed(2)
      : ((net_amount * parseFloat(val15)) / 100).toFixed(2);
  igst_amount =
    x === "TOKEN"
      ? ((token_amount * parseFloat(val16)) / 100).toFixed(2)
      : ((net_amount * parseFloat(val16)) / 100).toFixed(2);
  sgst_amount =
    x === "TOKEN"
      ? ((token_amount * parseFloat(val17)) / 100).toFixed(2)
      : ((net_amount * parseFloat(val17)) / 100).toFixed(2);
  total_gst = (
    parseFloat(cgst_amount) +
    parseFloat(igst_amount) +
    parseFloat(sgst_amount)
  ).toFixed(2);

  token_amount_inr = (
    (parseFloat(token_amount) + parseFloat(total_gst)) *
    parseFloat(val18)
  ).toFixed(2);
  // console.log(gstSwitchStatus);

  if (gstSwitchStatus) {
    gross_amount =
      x === "TOKEN"
        ? parseFloat(net_amount).toFixed(2)
        : (
            parseFloat(net_amount) +
            parseFloat(total_gst) -
            parseFloat(token_amount)
          ).toFixed(2);
    document.getElementById("total").innerHTML = parseFloat(
      gross_amount
    ).toFixed(2);
  } else {
    gross_amount = parseFloat(net_amount).toFixed(2);
    document.getElementById("total").innerHTML = parseFloat(
      gross_amount
    ).toFixed(2);
  }

  document.getElementById("base_amt").innerHTML = parseFloat(total).toFixed(2);

  document.getElementById("comm_amt").innerHTML = parseFloat(
    comm_amount
  ).toFixed(2);

  document.getElementById("ncf_amt").innerHTML = parseFloat(ncf_amount).toFixed(
    2
  );
  document.getElementById("tax_amt").innerHTML = parseFloat(tax_amount).toFixed(
    2
  );

  document.getElementById("hs_amt").innerHTML = parseFloat(hs_amount).toFixed(
    2
  );
  document.getElementById("gt_amt").innerHTML = parseFloat(
    gratuity_amount
  ).toFixed(2);
  document.getElementById("tds_amt").innerHTML = parseFloat(tds_amount).toFixed(
    2
  );
  document.getElementById("gst_amt").innerHTML = parseFloat(total_gst).toFixed(
    2
  );

  if (val18 === 0 || val18 == "") {
    gross_amount_inr = parseFloat(gross_amount).toFixed(2);
  } else {
    gross_amount_inr = (parseFloat(gross_amount) * parseFloat(val18)).toFixed(
      2
    );
  }
}

$(document).ready(function () {
  const btnClose = document.getElementById("btnClose");
  btnClose.addEventListener("click", (event) => {
    const window = remote.getCurrentWindow();
    window.close();
  });

  $(".datepicker").datepicker({
    defaultDate: new Date(),
    autoClose: true,
    format: "dd mmm yyyy",
    setDefaultDate: true,
  });
});

function formattedDate(dateValue) {
  const event = new Date(dateValue);
  const year = event.getFullYear();
  const month = event.getMonth() + 1;
  const getdate = event.getDate();
  return `${year}-${month}-${getdate}`;
}

// Send Form Data to Server

const isvalid = () => {
  let name = document.getElementById("name").value;
  let adults = document.getElementById("adults").value;
  let price_adults = document.getElementById("price_adults").value;
  let ship = document.getElementById("ship_name").value;
  let cruise = document.getElementById("cruise").value;
  let agent = document.querySelector(".agentName").value;

  if (
    name === "" ||
    adults === "" ||
    price_adults === "" ||
    ship === "" ||
    cruise === "" ||
    agent === ""
  ) {
    return false;
  } else {
    return true;
  }
};

var form = document.querySelector("form");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (isvalid()) {
    let data = new FormData(form);
    let invoiceData = {
      Invoice_Number: data.get("invoice_no"),
      Invoice_Type:
        data.get("invoiceType") === "TOKEN" ? "Token Invoice" : "Invoice",
      Invoice_Date: formattedDate(data.get("invoice_date")),
      Departure_Date: formattedDate(data.get("departure_date")),
      Agent_Name: data.get("agent"),
      Cruise_Ship: data.get("ship_name"),
      Cruise: data.get("cruise"),
      Currency: data.get("currency"),
      Booking: data.get("bookings"),
      Cabin: data.get("cabin"),
      Cat_Bkg: data.get("cat_bkg"),
      Pass_Name: data.get("name"),
      Nationality: data.get("nationality"),
      Adults: val1,
      Children: val2,
      Infants: val3,
      Adults_Rate: val4,
      Children_Rate: val5,
      Infants_Rate: val6,
      Comm_Rate: val7,
      Comm_Amt: comm_amount,
      NCF: val8,
      NCF_Amt: ncf_amount,
      TAX: val9,
      TAX_Amt: tax_amount,
      Grat: val10,
      Grat_Amt: gratuity_amount,
      HS: val11,
      HS_Amt: hs_amount,
      Misc: misc_amount,
      TDS: val13,
      TDS_Amt: tds_amount,
      Token_Amt: token_amount,
      Token_Amt_INR: token_amount_inr,
      CGST: val15,
      IGST: val16,
      SGST: val17,
      GST_Amt: total_gst,
      ROE: val18,
      Base_Amt: total,
      Total_Payable_Amt: gross_amount,
      Total_Payable_Amt_INR: gross_amount_inr,
      Token: false,
      GST: gstSwitchStatus,
      PAX: total_passenger,
      EntryDate: formattedDate(data.get("invoice_date")),
      Credit_Account: "ACC1",
      Credit_Amount:
        data.get("invoiceType") === "TOKEN"
          ? token_amount_inr
          : gross_amount_inr,
      Debit_Account: data.get("agent"),
      Debit_Amount:
        data.get("invoiceType") === "TOKEN"
          ? token_amount_inr
          : gross_amount_inr,
      EntryType:
        data.get("invoiceType") === "TOKEN" ? "Token Invoice" : "Invoice",
      InvoiceNumber: data.get("invoice_no"),
      Comments:
        data.get("invoiceType") === "TOKEN"
          ? `Token Invoice at R.O.E  ${val18}`
          : `Invoice at R.O.E  ${val18}`,
    };

    axios
      .post(`http://localhost:3000/api/invoice`, invoiceData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        alert(response.data.message);
        $("#btnSave").prop("disabled", true);
        $("#download").prop("disabled", false);
        $("#btnNew").prop("disabled", false);
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  }
});

ipcRenderer.on("fetchCustomers", (event, data) => {
  customers = [...data];
  var Options = "";
  data.map(function (element, i) {
    Options =
      Options + `<option value='${element.id}'>${element.first_name}</option>`;
  });

  $(".agentName").append(Options);
  $(".agentName").formSelect();
});

ipcRenderer.on("sendInvoiceNumber", (event, args) => {
  let date = new Date();
  let extractInvoice = args[0];
  let generatedInvoice = extractInvoice["@Invoice_Number"]
    ? extractInvoice["@Invoice_Number"]
    : `CC${date.getFullYear()}${date.getMonth() + 1}-00001`;

  document.getElementById("invoice_no").value = generatedInvoice;
});

$("#gst-switch").on("change", function () {
  gstSwitchStatus = $(this).is(":checked");
  GetTotal();
});

function checkInvoiceType(invoiceTag) {
  x = invoiceTag.options[invoiceTag.selectedIndex].text;

  GetTotal();

  if (x === "TOKEN") {
    $("#token").prop("disabled", false);
  } else {
    $("#token").prop("disabled", true);
  }
}

document.getElementById("download").addEventListener("click", (event) => {
  event.preventDefault();
  fs.access("C://PDF_REPORTS", function (error) {
    if (error) {
      // console.log("Directory does not exist.");
      fs.mkdirSync("C://PDF_REPORTS");
    }
  });
  const InvoiceNumber = document.getElementById("invoice_no").value;
  printInvoicePdf(InvoiceNumber);
});

document.getElementById("btnNew").addEventListener("click", (event) => {
  event.preventDefault();
  clearInputs();
  getInvoiceNumber().then((data) => {
    let inv = data[0];
    document.getElementById("invoice_no").value = inv["@Invoice_Number"];
  });
});

function clearInputs() {
  document.getElementById("invoice_no").value = "";
  document.getElementById("name").value = "";
  document.getElementById("adults").value = "";
  document.getElementById("children").value = "";
  document.getElementById("bookings").value = "";
  document.getElementById("cabin").value = "";
  document.getElementById("cat_bkg").value = "";
  document.getElementById("nationality").value = "";
  document.getElementById("infants").value = "";
  document.getElementById("price_adults").value = "";
  document.getElementById("price_children").value = "";
  document.getElementById("price_infants").value = "";
  document.getElementById("ship_name").value = "";
  document.getElementById("cruise").value = "";
  document.getElementById("comm").value = "";
  document.getElementById("ncf").value = "";
  document.getElementById("tax").value = "";
  document.getElementById("gratuity").value = "";
  document.getElementById("holiday").value = "";
  document.getElementById("misc").value = "";
  document.getElementById("tds").value = "";
  document.getElementById("roe").value = "";
  document.getElementById("cgst").value = "";
  document.getElementById("sgst").value = "";
  document.getElementById("igst").value = "";
  document.getElementById("download").disabled = true;
  document.getElementById("btnSave").disabled = false;
}

const getInvoiceNumber = async () => {
  return await axios
    .get(`http://localhost:3000/api/getinvoice`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// async function generatepdfInvoice() {
// 	const ledResults = {
// 		Invoice_Number: "sadghjsgd676",
// 		CompanyGSTIN: "37B76C238B7E1Z5",
// 	};

// 	let templateHtml = fs.readFileSync(
// 		path.join(__dirname, "../build/invoicetemplate.html"),
// 		"utf8"
// 	);

// 	let template = handlebars.compile(templateHtml);
// 	let html = template(ledResults);

// 	const pdfPath = `C://pdfreports//Ledger.pdf`;

// 	let options = {
// 		printBackground: true,
// 		path: pdfPath,
// 		format: "A4",
// 	};

// 	const browser = await puppeteer.launch({
// 		headless: true,
// 		// executablePath: path.join(
// 		// 	app.getAppPath(),
// 		// 	"../app.asar.unpacked/node_modules/puppeteer/.local-chromium/win64-722234/chrome-win/chrome.exe"
// 		// ),
// 		args: ["--no-sandbox", "--disable-setuid-sandbox"],
// 	});

// 	let page = await browser.newPage();
// 	await page.setContent(html);

// 	await page.pdf(options);
// 	await browser.close();

// 	alert("LEDGER GENERATED");
// }
