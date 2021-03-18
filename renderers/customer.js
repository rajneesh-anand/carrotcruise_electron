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
  $("select").formSelect();

  const btnClose = document.getElementById("btnClose");
  btnClose.addEventListener("click", (event) => {
    const window = remote.getCurrentWindow();
    window.close();
  });
});

const isvalid = () => {
  let firstName = document.getElementById("first_name").value;
  // let lastName = document.getElementById("last_name").value;
  let gstin = document.getElementById("gstin").value;
  let city = document.getElementById("city").value;
  // let pincode = document.getElementById("pincode").value;

  if (firstName === "" || gstin === "" || city === "") {
    return false;
  } else {
    return true;
  }
};

// const btnSave = document.getElementById("btnSave");
let form = document.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isvalid()) {
    let data = new FormData(form);
    let customerData = {
      prefix: "CUS",
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

    axios
      .post(
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
        alert(response.data.message);
        $("input").val("");
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
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
