const { ipcRenderer, remote } = require("electron");
const axios = require("axios");
var customers = [];
var accounts = [];

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

$(document).ready(function () {
  //-- closing form

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

const isvalid = () => {
  let aName = document.querySelector(".fromAccount");
  let bName = document.querySelector(".agentName");
  let amount = document.getElementById("amount").value;
  let fromname = aName.options[aName.selectedIndex].text;
  let agentname = bName.options[bName.selectedIndex].text;

  if (
    amount === "" ||
    amount === 0 ||
    fromname === "Select Account" ||
    agentname === "Select Agent"
  ) {
    return false;
  } else {
    return true;
  }
};

let form = document.querySelector("form");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  let eType = document.getElementById("entry");
  let Entry = eType.options[eType.selectedIndex].text;

  if (isvalid()) {
    let data = new FormData(form);
    let paymentData = {
      date: formattedDate(data.get("payment_date")),
      entryType: Entry,
      creditAccount: data.get("fromAccount"),
      creditAmount: data.get("amount"),
      debitAccount: data.get("agent"),
      debitAmount: data.get("amount"),
      chequeNumber: data.get("cheque") ? data.get("cheque").toUpperCase() : "",
      remarks: data.get("comment") ? data.get("comment").toUpperCase() : "",
      bankName: data.get("bank_name")
        ? data.get("bank_name").toUpperCase()
        : "",
    };

    axios
      .post(`http://localhost:3000/api/payment`, paymentData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        alert(response.data.message);
        $("#bank_name").val("");
        $("#cheque").val("");
        $("#comment").val("");
        $("#showBalance").text("");
      })
      .catch((error) => {
        alert(error.response.data.message);
      });

    // $(":input").prop("disabled", true);
  }
});

function getAccountBalance() {
  let accountId = document.getElementById("agent").value;
  let balanceField = document.getElementById("showBalance");

  axios
    .get(`http://localhost:3000/api/customerbalance/${accountId}`)
    .then((response) => {
      let Credit = response.data.data[0];
      let CreditAmount = Credit[0].credit;
      let Debit = response.data.data[1];
      let DebitAmount = Debit[0].debit;
      console.log(CreditAmount);
      console.log(DebitAmount);
      let Balance = (CreditAmount - DebitAmount).toFixed(2);
      console.log(Balance);

      if (Balance > 0) {
        balanceField.innerText = `Balance :  ${String.fromCharCode(
          0x20b9
        )} ${thFormat(Balance)} Cr `;
      } else if (Balance < 0) {
        balanceField.innerText = `Balance :  ${String.fromCharCode(
          0x20b9
        )} ${thFormat(Math.abs(Balance))} Dr `;
      } else {
        balanceField.innerText = `Balance :  ${String.fromCharCode(
          0x20b9
        )}  0.00 `;
      }
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
}

function checkPaymentType(paymentTag) {
  var x = paymentTag.options[paymentTag.selectedIndex].text;

  if (x === "BANK-PAYMENT") {
    $("#bank_name").prop("disabled", false);
    $("#cheque").prop("disabled", false);
  } else {
    $("#bank_name").val("");
    $("#cheque").val("");
    $("#bank_name").prop("disabled", true);
    $("#cheque").prop("disabled", true);
  }
}
//convert date format for database
function formattedDate(dateValue) {
  const event = new Date(dateValue);
  const year = event.getFullYear();
  const month = event.getMonth() + 1;
  const getdate = event.getDate();
  return `${year}-${month}-${getdate}`;
}

ipcRenderer.on("fetchCustomers", (event, data) => {
  customers = [...data];
  // console.log(customers);
  var Options = "";
  data.map(function (element, i) {
    Options =
      Options + `<option value='${element.id}'>${element.first_name}</option>`;
  });

  $(".agentName").append(Options);
  $(".agentName").formSelect();
});

ipcRenderer.on("fetchAccounts", (event, data) => {
  // console.log(data);
  accounts = [...data];

  var Options = "";
  data.map(function (element, i) {
    Options =
      Options +
      `<option value='${element.id}'>${element.Account_Name}</option>`;
  });

  $(".fromAccount").append(Options);
  $(".fromAccount").formSelect();
});

// document.getElementById("ledger").addEventListener("click", (event) => {
// 	event.preventDefault();
// 	let accountId = document.getElementById("agent").value;

// 	axios
// 		.get(`http://localhost:3000/api/ledgerpdf/${accountId}`)
// 		.then((response) => {
// 			console.log(response.data);
// 		})
// 		.catch((error) => {
// 			if (error) throw new Error(error);
// 		});
// });
