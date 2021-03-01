const electron = require("electron");
const remote = electron.remote;
const { ipcRenderer } = electron;
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");

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
  addRow();
});

function formattedDate(dateValue) {
  const event = new Date(dateValue);
  const year = event.getFullYear();
  const month = event.getMonth() + 1;
  const getdate = event.getDate();
  return `${year}-${month}-${getdate}`;
}

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

ipcRenderer.on("sendInvoiceNumber", (event, args) => {
  let date = new Date();

  let extractInvoice = args[0];

  let generatedInvoice = extractInvoice["@Invoice_Number"]
    ? extractInvoice["@Invoice_Number"]
    : `CC${date.getFullYear()}${date.getMonth() + 1}-00001`;

  document.getElementById("invoice_no").value = generatedInvoice;
});

const addItem = document.getElementById("btnInsertNewRow");
addItem.addEventListener("click", (e) => {
  e.preventDefault();
  var empTab = document.getElementById("itemTable");
  var rowCnt = empTab.rows.length;

  var qty = empTab.rows[rowCnt - 1].cells[1].children[0].value;
  var rate = empTab.rows[rowCnt - 1].cells[2].children[0].value;
  var total = empTab.rows[rowCnt - 1].cells[3].innerText;
  console.log(total);

  if (total === "" || total == 0) {
    return;
  }

  addRow();
});

function addRow() {
  var empTab = document.getElementById("itemTable");
  var rowCnt = empTab.rows.length; // get the number of rows.
  var tr = empTab.insertRow(rowCnt); // table row.
  //   tr = empTab.insertRow(rowCnt);

  for (var c = 0; c < 5; c++) {
    var td = document.createElement("td"); // TABLE DEFINITION.
    td = tr.insertCell(c);

    if (c == 4) {
      // if its the first column of the table.
      // add a button control.
      var button = document.createElement("input");

      // set the attributes.
      button.setAttribute("type", "button");
      button.setAttribute("value", "X");

      // add button's "onclick" event.
      button.setAttribute("onclick", "removeRow(this)");
      td.appendChild(button);
    } else if (c == 0) {
      var ele = document.createElement("SELECT");
      // ele.setAttribute("id", `s${rowCnt}`);
      ele.setAttribute("class", "browser-default");
      var z = document.createElement("option");
      ele.appendChild(z);
      z.setAttribute("value", "volvocar");
      var t = document.createTextNode("Volvofgdfhrytryfghgf");
      z.appendChild(t);
      td.appendChild(ele);
      // document.getElementById(`s${rowCnt}`).appendChild(z);
    } else if (c == 1) {
      var ele = document.createElement("input");
      ele.setAttribute("type", "text");
      // ele.setAttribute("value", "");
      ele.setAttribute("onkeypress", "return ValidateNumbers(event)");
      ele.setAttribute("onkeyup", "GetTotal()");
      td.appendChild(ele);
    } else if (c == 2) {
      var ele = document.createElement("input");
      ele.setAttribute("type", "text");
      ele.setAttribute("value", "");
      ele.setAttribute("onkeypress", "return isNumberKey(event,this)");
      ele.setAttribute("onkeyup", "GetTotal()");
      td.appendChild(ele);
    }
  }
}

// function to delete a row.
function removeRow(oButton) {
  let empTab = document.getElementById("itemTable");
  let rowCnt = empTab.rows.length;
  console.log(rowCnt);
  if (rowCnt === 2) {
    return;
  } else {
    empTab.deleteRow(oButton.parentNode.parentNode.rowIndex);
    CalculateTotal_AfterRowDelete();
  }
}

function CalculateTotal_AfterRowDelete() {
  let empTab = document.getElementById("itemTable");
  let netTotal = 0;
  for (var i = 1; i < empTab.rows.length; i++) {
    let rowTotal =
      empTab.rows[i].cells[3].innerText === ""
        ? 0
        : empTab.rows[i].cells[3].innerText;
    netTotal = netTotal + parseFloat(rowTotal);
  }
  document.getElementById("baseAmt").innerText = netTotal.toFixed(2);

  let cgstRate =
    document.getElementById("cgstRate").value === ""
      ? 0
      : document.getElementById("cgstRate").value;

  let igstRate =
    document.getElementById("igstRate").value === ""
      ? 0
      : document.getElementById("igstRate").value;
  let sgstRate =
    document.getElementById("sgstRate").value === ""
      ? 0
      : document.getElementById("sgstRate").value;

  let cgstAmount = (
    (parseFloat(netTotal) * parseFloat(cgstRate)) /
    100
  ).toFixed(2);
  let igstAmount = (
    (parseFloat(netTotal) * parseFloat(igstRate)) /
    100
  ).toFixed(2);
  let sgstAmount = (
    (parseFloat(netTotal) * parseFloat(sgstRate)) /
    100
  ).toFixed(2);

  let Total =
    parseFloat(netTotal) +
    parseFloat(cgstAmount) +
    parseFloat(igstAmount) +
    parseFloat(sgstAmount);

  document.getElementById("cgstAmount").innerText = cgstAmount;
  document.getElementById("igstAmount").innerText = igstAmount;
  document.getElementById("sgstAmount").innerText = sgstAmount;
  document.getElementById("totalAmount").innerText = Total.toFixed(2);
}

function GetTotal() {
  var netTotal = 0;
  var tableRows = document.getElementById("itemTable").rows;
  console.log(tableRows);
  for (var i = 1; i < tableRows.length; i++) {
    let el = tableRows[i].children;
    let rQnty = el[1].children[0].value === "" ? 0 : el[1].children[0].value;
    let rRate = el[2].children[0].value === "" ? 0 : el[2].children[0].value;
    let rTotal = parseFloat(rQnty) * parseFloat(rRate);
    tableRows[i].cells[3].innerHTML = rTotal;
    netTotal = netTotal + parseFloat(rTotal);
  }

  document.getElementById("baseAmt").innerText = netTotal.toFixed(2);

  let cgstRate =
    document.getElementById("cgstRate").value === ""
      ? 0
      : document.getElementById("cgstRate").value;

  let igstRate =
    document.getElementById("igstRate").value === ""
      ? 0
      : document.getElementById("igstRate").value;
  let sgstRate =
    document.getElementById("sgstRate").value === ""
      ? 0
      : document.getElementById("sgstRate").value;

  let cgstAmount = (
    (parseFloat(netTotal) * parseFloat(cgstRate)) /
    100
  ).toFixed(2);
  let igstAmount = (
    (parseFloat(netTotal) * parseFloat(igstRate)) /
    100
  ).toFixed(2);
  let sgstAmount = (
    (parseFloat(netTotal) * parseFloat(sgstRate)) /
    100
  ).toFixed(2);

  let Total =
    parseFloat(netTotal) +
    parseFloat(cgstAmount) +
    parseFloat(igstAmount) +
    parseFloat(sgstAmount);

  document.getElementById("cgstAmount").innerText = cgstAmount;
  document.getElementById("igstAmount").innerText = igstAmount;
  document.getElementById("sgstAmount").innerText = sgstAmount;
  document.getElementById("totalAmount").innerText = Total.toFixed(2);
}

function table_to_array(table_id) {
  var my_list = [];
  const myData = document.getElementById(table_id).rows;
  const lastRow = myData[myData.length - 1].children;

  if (
    lastRow[1].children[0].value === "" ||
    lastRow[2].children[0].value === ""
  ) {
    for (var i = 1; i < myData.length - 1; i++) {
      let el = myData[i].children;
      let itemName = el[0].innerText;
      let rQnty = el[1].children[0].value;
      let rRate = el[2].children[0].value;
      let rTotal = el[3].innerText;
      let rowItem = {
        itemName: itemName,
        rQnty: rQnty,
        rRate: rRate,
        rTotal: parseFloat(rTotal).toFixed(2),
      };
      my_list.push(rowItem);
    }
  } else {
    for (var i = 1; i < myData.length; i++) {
      let el = myData[i].children;
      let itemName = el[0].innerText;
      let rQnty = el[1].children[0].value;
      let rRate = el[2].children[0].value;
      let rTotal = el[3].innerText;
      let rowItem = {
        itemName: itemName,
        rQnty: rQnty,
        rRate: rRate,
        rTotal: parseFloat(rTotal).toFixed(2),
      };
      my_list.push(rowItem);
    }
  }
  return JSON.stringify(my_list);
}

function CalculateTotal(obj) {
  let baseAmount =
    document.getElementById("baseAmt").innerText === ""
      ? 0
      : document.getElementById("baseAmt").innerText;

  let cgstRate =
    document.getElementById("cgstRate").value === ""
      ? 0
      : document.getElementById("cgstRate").value;

  let igstRate =
    document.getElementById("igstRate").value === ""
      ? 0
      : document.getElementById("igstRate").value;
  let sgstRate =
    document.getElementById("sgstRate").value === ""
      ? 0
      : document.getElementById("sgstRate").value;

  let cgstAmount = (
    (parseFloat(baseAmount) * parseFloat(cgstRate)) /
    100
  ).toFixed(2);
  let igstAmount = (
    (parseFloat(baseAmount) * parseFloat(igstRate)) /
    100
  ).toFixed(2);
  let sgstAmount = (
    (parseFloat(baseAmount) * parseFloat(sgstRate)) /
    100
  ).toFixed(2);

  let Total =
    parseFloat(baseAmount) +
    parseFloat(cgstAmount) +
    parseFloat(igstAmount) +
    parseFloat(sgstAmount);

  document.getElementById("cgstAmount").innerText = cgstAmount;
  document.getElementById("igstAmount").innerText = igstAmount;
  document.getElementById("sgstAmount").innerText = sgstAmount;
  document.getElementById("totalAmount").innerText = Total.toFixed(2);
}

function formattedDate(dateValue) {
  const event = new Date(dateValue);
  const year = event.getFullYear();
  const month = event.getMonth() + 1;
  const getdate = event.getDate();
  return `${year}-${month}-${getdate}`;
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

document.getElementById("btnDownload").addEventListener("click", (event) => {
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
  getInvoiceNumber().then((data) => {
    let inv = data[0];
    document.getElementById("invoice_no").value = inv["@Invoice_Number"];
  });
});

var form = document.querySelector("form");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  let baseAmt = document.getElementById("baseAmt").innerText;
  let cgstAmt = document.getElementById("cgstAmount").innerText;
  let sgstAmt = document.getElementById("sgstAmount").innerText;
  let igstAmt = document.getElementById("igstAmount").innerText;
  let totalAmt = document.getElementById("totalAmount").innerText;
  let totalgst =
    parseFloat(cgstAmt) + parseFloat(sgstAmt) + parseFloat(igstAmt);

  let data = new FormData(form);

  let invoiceData = {
    InvoiceItems: table_to_array("itemTable"),
    Invoice_Number: data.get("invoice_no"),
    Invoice_Date: formattedDate(data.get("invoice_date")),
    Agent_Name: data.get("agent"),
    Base_Amount: baseAmt,
    Cgst_Rate: data.get("cgstRate") === "" ? 0 : data.get("cgstRate"),
    Sgst_Rate: data.get("sgstRate") === "" ? 0 : data.get("sgstRate"),
    Igst_Rate: data.get("igstRate") === "" ? 0 : data.get("igstRate"),
    Cgst_Amount: cgstAmt,
    Sgst_Amount: sgstAmt,
    Igst_Amount: igstAmt,
    TotalGst_Amount: totalgst.toFixed(2),
    Total_Amount: totalAmt,
    Credit_Account: "ACC1",
    Credit_Amount: totalAmt,
    Debit_Account: data.get("agent"),
    Debit_Amount: totalAmt,
    EntryType: "Invoice",
    InvoiceNumber: data.get("invoice_no"),
    Comments: "INVOICE",
  };
  console.log(invoiceData);

  axios
    .post(`http://localhost:3000/api/invoiceitems`, invoiceData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      alert(response.data.message);
      $("#btnSave").prop("disabled", true);
      $("#btnDownload").prop("disabled", false);
      $("#btnNew").prop("disabled", false);
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
});
