const electron = require("electron");
const { ipcRenderer, remote } = electron;
const axios = require("axios");

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

$(document).ready(function () {
  M.updateTextFields();
  $("select").formSelect();

  const btnClose = document.getElementById("btnClose");
  btnClose.addEventListener("click", (event) => {
    const window = remote.getCurrentWindow();
    window.close();
  });
});

const isvalid = () => {
  let firstName = document.getElementById("first_name").value;
  let address = document.getElementById("address_one").value;
  let gstin = document.getElementById("gstin").value;
  let city = document.getElementById("city").value;

  if (firstName === "" || address === "" || gstin === "" || city === "") {
    return false;
  } else {
    return true;
  }
};

let form = document.querySelector("form");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (isvalid()) {
    var data = new FormData(form);
    let customerData = {
      id: data.get("id"),
      first_name: data.get("first_name").toUpperCase(),
      last_name: data.get("last_name").toUpperCase(),
      address_line_one: data.get("address_one").toUpperCase(),
      address_line_two: data.get("address_two").toUpperCase(),
      city: data.get("city").toUpperCase(),
      pincode: data.get("pincode"),
      state: data.get("state"),
      phone: data.get("phone"),
      mobile: data.get("mobile"),
      gstin: data.get("gstin").toUpperCase(),
      email: data.get("email"),
      pan: data.get("pan").toUpperCase(),
    };

    // console.log(customerData);

    axios
      .put(
        `http://localhost:3000/api/customer`,
        customerData,

        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        const window = remote.getCurrentWindow();
        window.close();
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
    $(":input").prop("disabled", true);
  }
});

ipcRenderer.on("fetchStates", (event, data) => {
  var Options = "";
  data.map(function (element, i) {
    Options =
      Options + `<option value='${element.id}'>${element.State_Name}</option>`;
  });

  $(".stateName").append(Options);
  $(".stateName").formSelect();
});

ipcRenderer.on("sendCustomerDataForEdit", (event, data) => {
  document.getElementById("id").value = data.id;
  document.getElementById("first_name").value = data.first_name;
  document.getElementById("last_name").value = data.last_name;
  document.getElementById("address_one").value = data.address_line_one;
  document.getElementById("address_two").value = data.address_line_two;
  document.getElementById("city").value = data.city;
  document.getElementById("pincode").value = data.pincode;
  document.getElementById("mobile").value = data.mobile;
  document.getElementById("phone").value = data.phone;
  document.getElementById("email").value = data.email;
  document.getElementById("gstin").value = data.gstin;
  document.getElementById("state").value = data.state;
  document.getElementById("pan").value = data.pan;
});
