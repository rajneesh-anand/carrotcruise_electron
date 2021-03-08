const electron = require("electron");
const remote = electron.remote;
const { ipcRenderer } = electron;
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");

var itemList = [];

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
  itemNames();
});

function formattedDate(dateValue) {
  const event = new Date(dateValue);
  const year = event.getFullYear();
  const month = event.getMonth() + 1;
  const getdate = event.getDate();
  return `${year}-${month}-${getdate}`;
}

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
});

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

// function addRow() {
//   var table = document.getElementById("itemTable");
//   var tr = document.createElement("tr");
//   tr.innerHTML =
//     "<td>" +
//     `<select class="browser-default"> ${itemsNames.map(
//       (item) => `<option value=${item}>${item}</option>`
//     )}
//     </select>` +
//     "</td>" +
//     "<td>" +
//     `<input type=text onkeypress= return ValidateNumbers(event) onkeyup=GetTotal() />` +
//     "</td>" +
//     "<td>" +
//     `<input type=text onkeypress= return ValidateNumbers(event) onkeyup=GetTotal() />` +
//     "</td>" +
//     "<td>" +
//     "</td>" +
//     "<td>" +
//     "<button type=button onclick=removeRow(this)>" +
//     "X" +
//     "</button>" +
//     "</td>";
//   table.appendChild(tr);
// }

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
    .put(`http://localhost:3000/api/invoiceitems`, invoiceData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      alert(response.data.message);
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
});

function dateddmmmyyyy(args) {
  let event = new Date(`${args}`);
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

ipcRenderer.on("sendInvoiceDataForEdit", (event, args) => {
  console.log(args[0]);
  setInvoiceData(args[0]);
});

function setInvoiceData(data) {
  document.getElementById("invoice_no").value = data.Invoice_Number;
  document.getElementById("invoice_date").value = dateddmmmyyyy(
    data.Invoice_Date
  );
  document.getElementById("agentName").value = data.Customer_Id;
  document.getElementById("invoicetype").value = data.Invoice_Type;
  document.getElementById(
    "TotalTaxableAmount"
  ).innerHTML = data.Base_Amount.toFixed(2);

  document.getElementById(
    "totalGstAmount"
  ).innerHTML = data.TOTAL_GST_Amount.toFixed(2);

  document.getElementById("totalAmount").innerHTML = data.TOTAL_Amount.toFixed(
    2
  );

  const rowItems = JSON.parse(data.Invoice_Items);
  append_json(rowItems);
}

function append_json(data) {
  console.log(data);
  var table = document.getElementById("itemTable");
  data.forEach(function (object, index) {
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" +
      `<select class="browser-default"> <option value='${object.itemName}'>${object.itemName}</option></select>` +
      "</td>" +
      "<td>" +
      `<input type=text value=${
        object.rQnty
      } onkeypress= return ValidateNumbers(event) onkeyup=GetTotal(${
        index + 1
      }) />` +
      "</td>" +
      "<td>" +
      `<input type=text value=${
        object.rRate
      } onkeypress= return ValidateNumbers(event) onkeyup=GetTotal(${
        index + 1
      }) />` +
      "</td>" +
      "<td>" +
      object.rTotal +
      "</td>" +
      "<td>" +
      object.rGstRate +
      "</td>" +
      "<td>" +
      object.rGst +
      "</td>" +
      "<td>" +
      "<button type=button onclick=removeRow(this)>" +
      "X" +
      "</button>" +
      "</td>";
    table.appendChild(tr);
  });
}
