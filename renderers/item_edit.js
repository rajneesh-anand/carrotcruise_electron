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
  let name = document.getElementById("item_name").value;
  if (name === "") {
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
    let itemData = {
      id: data.get("id"),
      name: data.get("item_name").toUpperCase(),
      gst_rate: data.get("entryType"),
      unit_price: parseFloat(data.get("rate")).toFixed(2),
    };

    console.log(itemData);

    axios
      .put(`http://localhost:3000/api/updateitem`, itemData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log(response);
        alert(response.data.message);
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  }
});

ipcRenderer.on("sendItemDataForEdit", (event, data) => {
  console.log(data);
  document.getElementById("id").value = data.Id;
  document.getElementById("item_name").value = data.Item_Name;
  document.getElementById("rate").value = data.Unit_Price;
  document.getElementById("entryType").value = data.Gst_Rate;
});
