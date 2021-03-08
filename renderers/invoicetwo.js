const electron = require("electron");
const remote = electron.remote;
const { ipcRenderer } = electron;
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const { event } = require("jquery");

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
var itemList = [];
// var gstRate = 0;

$(function () {
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
  itemNames(addRow, 1);
});

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "Escape":
      const window = remote.getCurrentWindow();
      window.close();
      break;
  }
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
  let table = document.getElementById("itemTable");
  let rowCnt = table.rows.length;

  let total = table.rows[rowCnt - 1].cells[3].innerText;
  if (total === "" || total == 0) {
    return;
  }
  addRow(rowCnt);
  // populateItemList();
});

//const itemsNames = ["Car", "Bike", "volvocar"];

function itemNames(cb) {
  axios
    .get(`http://localhost:3000/api/fetchitemnames`)
    .then((response) => {
      response.data.data.map((item) => {
        itemList.push(item);
      });
      cb(arguments[1]);
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
}

function findGstRate(selectedValue) {
  console.log(selectedValue);
  const result = itemList.find(({ Item_Name }) => Item_Name === selectedValue);
  let gstRate = parseFloat(result.Gst_Rate.slice(0, -1));
  console.log(gstRate);
  return gstRate.toFixed(2);
}

function addRow(trIndex) {
  let table = document.getElementById("itemTable");
  let tr = document.createElement("tr");
  tr.innerHTML =
    "<td>" +
    `<select id="itemSelect" class="browser-default itemSelect" onchange="findGstRate(this.value)">  
    ${itemList.map(
      (item) => `<option value='${item.Item_Name}'>${item.Item_Name}</option>`
    )}  
    </select>` +
    "</td>" +
    "<td>" +
    `<input type=text onkeypress= return ValidateNumbers(event) onkeyup=GetTotal(${trIndex}) />` +
    "</td>" +
    "<td>" +
    `<input type=text onkeypress= return ValidateNumbers(event) onkeyup=GetTotal(${trIndex}) />` +
    "</td>" +
    "<td>" +
    "</td>" +
    "<td>" +
    "</td>" +
    "<td>" +
    "</td>" +
    "<td>" +
    "<button type=button onclick=removeRow(this)>" +
    "X" +
    "</button>" +
    "</td>";
  table.appendChild(tr);
}
// function to delete a row.
function removeRow(oButton) {
  let table = document.getElementById("itemTable");
  let rowCnt = table.rows.length;

  if (oButton.parentNode.parentNode.rowIndex === 1) {
    return;
  } else {
    table.deleteRow(oButton.parentNode.parentNode.rowIndex);
    setInvoiceAmount();
  }
}

function GetTotal(rowIndex) {
  console.log(rowIndex);
  var tableRows = document.getElementById("itemTable").rows;
  let el = tableRows[rowIndex].children;
  let itemName = el[0].children[0].value === "" ? 0 : el[0].children[0].value;
  console.log(itemName);
  let gstRate = findGstRate(itemName);
  console.log(gstRate);
  let rQnty = el[1].children[0].value === "" ? 0 : el[1].children[0].value;
  let rRate = el[2].children[0].value === "" ? 0 : el[2].children[0].value;
  let rTotal = parseFloat(rQnty) * parseFloat(rRate);
  let rGST = (parseFloat(rTotal) * parseFloat(gstRate)) / 100;
  tableRows[rowIndex].cells[4].innerHTML = gstRate;
  tableRows[rowIndex].cells[5].innerHTML = rGST.toFixed(2);
  tableRows[rowIndex].cells[3].innerHTML = rTotal.toFixed(2);
  setInvoiceAmount();
}

function setInvoiceAmount() {
  var totalTaxableAmount = 0;
  var totalGstAmount = 0;
  var totalAmount = 0;
  const tRows = document.getElementById("itemTable").rows;

  for (var i = 1; i < tRows.length; i++) {
    let el = tRows[i].children;
    totalTaxableAmount = totalTaxableAmount + parseFloat(el[3].innerText);
    totalGstAmount = totalGstAmount + parseFloat(el[5].innerText);
  }
  totalAmount = parseFloat(totalTaxableAmount) + parseFloat(totalGstAmount);
  document.getElementById(
    "TotalTaxableAmount"
  ).innerText = totalTaxableAmount.toFixed(2);
  document.getElementById("totalGstAmount").innerText = totalGstAmount.toFixed(
    2
  );
  document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);
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

      let itemName = myData[i].children[0].childNodes[0].value;
      let rQnty = el[1].children[0].value;
      let rRate = el[2].children[0].value;
      let rTotal = el[3].innerText;
      let rGstRate = el[4].innerText;
      let rGst = el[5].innerText;

      let rowItem = {
        itemName: itemName,
        rQnty: rQnty,
        rRate: rRate,
        rTotal: parseFloat(rTotal).toFixed(2),
        rGst: parseFloat(rGst).toFixed(2),
        rGstRate: parseFloat(rGstRate),
      };

      my_list.push(rowItem);
    }
  } else {
    for (var i = 1; i < myData.length; i++) {
      let el = myData[i].children;

      let itemName = myData[i].children[0].childNodes[0].value;
      let rQnty = el[1].children[0].value;
      let rRate = el[2].children[0].value;
      let rTotal = el[3].innerText;
      let rGstRate = el[4].innerText;
      let rGst = el[5].innerText;

      let rowItem = {
        itemName: itemName,
        rQnty: rQnty,
        rRate: rRate,
        rTotal: parseFloat(rTotal).toFixed(2),
        rGst: parseFloat(rGst).toFixed(2),
        rGstRate: parseFloat(rGstRate),
      };
      my_list.push(rowItem);
    }
  }
  return JSON.stringify(my_list);
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

const isvalid = () => {
  let baseAmount = document.getElementById("TotalTaxableAmount").innerText;
  let agent = document.querySelector(".agentName").value;

  if (baseAmount === "" || baseAmount === "0.00" || agent === "") {
    return false;
  } else {
    return true;
  }
};

var form = document.querySelector("form");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (isvalid()) {
    let taxableAmt = document.getElementById("TotalTaxableAmount").innerText;
    let gstAmt = document.getElementById("totalGstAmount").innerText;
    let totalAmt = document.getElementById("totalAmount").innerText;

    let data = new FormData(form);

    let invoiceData = {
      InvoiceItems: table_to_array("itemTable"),
      Invoice_Number: data.get("invoice_no"),
      Invoice_Date: formattedDate(data.get("invoice_date")),
      Agent_Name: data.get("agent"),
      Invoice_Type: data.get("invoicetype"),
      Base_Amount: parseFloat(taxableAmt).toFixed(2),
      TotalGst_Amount: parseFloat(gstAmt).toFixed(2),
      Total_Amount: parseFloat(totalAmt).toFixed(2),
      Credit_Account:
        data.get("invoicetype") === "CREDIT INVOICE" ? "ACC1" : "ACC2",
      Credit_Amount: parseFloat(totalAmt).toFixed(2),
      Debit_Account: data.get("agent"),
      Debit_Amount: parseFloat(totalAmt).toFixed(2),
      EntryType: data.get("invoicetype"),
      InvoiceNumber: data.get("invoice_no"),
      Comments:
        data.get("invoicetype") === "CREDIT INVOICE"
          ? "INVOICE"
          : "CASH INVOICE",
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
  } else {
    alert("Please enter mandatory fields* !");
  }
});
