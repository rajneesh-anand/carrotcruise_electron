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

  accountData("BANK-RECEIVE").then((res) => {
    populateSelectField(res.data, "bank");
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
      entryType:
        Entry === "BANK-RECEIVE" ? "Bank Transaction" : "Cash Transaction",
      creditAccount: data.get("agent"),
      creditAmount: data.get("amount"),
      debitAccount: data.get("fromAccount"),
      debitAmount: data.get("amount"),
      chequeNumber: data.get("cheque") ? data.get("cheque").toUpperCase() : "",
      remarks: data.get("comment") ? data.get("comment") : "",
      bankName: data.get("bank_name")
        ? data.get("bank_name").toUpperCase()
        : "",
    };

    axios
      .post(`http://localhost:3000/api/receipt`, paymentData, {
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
        $("#amount").val("");
        $("#showBalance").text("");
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  }
});

function getAccountBalance() {
  let accountId = document.getElementById("agent").value;
  let balanceField = document.getElementById("showBalance");
  // console.log(accountId);

  axios
    .get(`http://localhost:3000/api/customerbalance/${accountId}`)
    .then((response) => {
      let Credit = response.data.data[0];
      let CreditAmount = Credit[0].credit;
      let Debit = response.data.data[1];
      let DebitAmount = Debit[0].debit;

      let Balance = (CreditAmount - DebitAmount).toFixed(2);
      console.log(Balance);

      if (Balance > 0) {
        balanceField.innerText = `Balance :  ${String.fromCharCode(
          0x20b9
        )} ${thFormat(Balance)}  Cr `;
      } else if (Balance < 0) {
        balanceField.innerText = `Balance :  ${String.fromCharCode(
          0x20b9
        )} ${thFormat(Math.abs(Balance).toFixed(2))}  Dr `;
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

const accountData = async (id) => {
  const { data } = await axios.get(`http://localhost:3000/api/accounts/${id}`);
  return data;
};
function populateSelectField(data, type) {
  $(".fromAccount option").remove();
  var Options =
    type === "bank"
      ? `<option value="" disabled selected>Select Bank Account</option>`
      : `<option value="" disabled selected>Select Account</option>`;
  data.map(function (element, i) {
    Options =
      Options +
      `<option value='${element.id}'>${element.Account_Name}</option>`;
  });

  $(".fromAccount").append(Options);
  $(".fromAccount").formSelect();
}
function checkPaymentType(paymentTag) {
  var x = paymentTag.options[paymentTag.selectedIndex].text;

  if (x === "BANK-RECEIVE") {
    accountData(x)
      .then((res) => {
        populateSelectField(res.data, "bank");
      })
      .catch((error) => console.log(error));
    $("#bank_name").prop("disabled", false);
    $("#cheque").prop("disabled", false);
  } else {
    accountData(x)
      .then((res) => {
        console.log(res.data);
        populateSelectField(res.data, "account");
      })
      .catch((error) => console.log(error));
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

// ipcRenderer.on("fetchAccounts", (event, data) => {
//   accounts = [...data];

//   var Options = "";
//   data.map(function (element, i) {
//     Options =
//       Options +
//       `<option value='${element.id}'>${element.Account_Name}</option>`;
//   });

//   $(".fromAccount").append(Options);
//   $(".fromAccount").formSelect();
// });
