const electron = require("electron");
const { ipcRenderer, remote } = electron;
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const axios = require("axios");
const app = remote.app;
const handlebars = require("handlebars");
const storage = require("electron-json-storage");

let dataTableRecords = [];
let dataPath = null;

handlebars.registerHelper("ifEqual", function (a, b, options) {
  console.log(a, b)
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

handlebars.registerHelper("sumDebit", function (arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    s = s + arr[i].Debit;
  }

  return s.toFixed(2);
});

handlebars.registerHelper("sumCredit", function (arr) {
  let s = 0;
  for (let i = 0; i < arr.length; i++) {
    s = s + arr[i].Credit;
  }

  return s;
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

handlebars.registerHelper("halfValue", function (a) {
  let s = a / 2;
  return s;
});

handlebars.registerHelper("halfValueAmount", function (a) {
  let s = a / 2;
  return s.toFixed(2);
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

const texts = remote.getGlobal("sharedObject").someProperty;

// document.getElementById("abc").value = texts;

// async function ifInvoiceExits() {
//   let { data } = await axios.get(`http://localhost:3000/api/getinvoices`);

//   return data.data.length;
// }

// async function ifCustomerExits() {
//   let { data } = await axios.get(`http://localhost:3000/api/getcustomers`);
//   return data.data.length;
// }

function getLedgerListAPICall(callback) {
  axios
    .get(`http://localhost:3000/api/ledgerlist`)
    .then((response) => {
      dataTableRecords.splice(0, dataTableRecords.length);

      const ledgerData = response.data.data;
      dataTableRecords = [...ledgerData];

      // leddata = [...ledgerData];
      return callback(response.data.message);
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
}

function getGeneralLedgerListAPICall(callback) {
  axios
    .get(`http://localhost:3000/api/generalledgerlist`)
    .then((response) => {
      dataTableRecords.splice(0, dataTableRecords.length);

      const ledgerData = response.data.data;
      dataTableRecords = [...ledgerData];

      return callback(response.data.message);
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
}

function getPaymentListAPICall(callback) {
  axios
    .get(`http://localhost:3000/api/paymentlist`)
    .then((response) => {
      dataTableRecords.splice(0, dataTableRecords.length);

      const paymmentData = response.data.data;
      dataTableRecords = [...paymmentData];

      // const paymmentData = response.data.data;
      // console.log(paymmentData);

      // paydata = [...paymmentData];
      return callback(response.data.message);
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
}

function getReceiveListAPICall(callback) {
  axios
    .get(`http://localhost:3000/api/receivelist`)
    .then((response) => {
      dataTableRecords.splice(0, dataTableRecords.length);

      const paymmentData = response.data.data;
      dataTableRecords = [...paymmentData];

      // const paymmentData = response.data.data;
      // console.log(paymmentData);

      // paydata = [...paymmentData];
      return callback(response.data.message);
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
}

$(function () {
  dataPath = path.join(storage.getDataPath(), "../storage");
  storage.setDataPath(dataPath);

  storage.get("userlogin", function (error, data) {
    if (error) throw error;

    document.getElementById("userName").innerText = data.name;

    if (data.role === "Member") {
      $("#setAccount ").on("mouseenter", function () {
        $(this)
          .children("a")
          .on("click", function () {
            return false;
          });
      });

      $("#setPayment ").on("mouseenter", function () {
        $(this)
          .children("a")
          .on("click", function () {
            return false;
          });
      });

      $("#setReceive ").on("mouseenter", function () {
        $(this)
          .children("a")
          .on("click", function () {
            return false;
          });
      });

      $("#newUser a").on("click", function () {
        return false;
      });
    }
  });

  generateInvoiceDataTable();
});

const btnlogOut = document.getElementById("btnLogout");
btnlogOut.addEventListener("click", (event) => {
  //   dataPath = path.join(storage.getDataPath(), "../storage");
  //   storage.setDataPath(dataPath);
  console.log(dataPath);

  storage.remove("userlogin", function (error) {
    if (error) throw error;

    ipcRenderer.send("logout:request");
    const window = remote.getCurrentWindow();
    window.close();
  });
});

// Company Details

$(function () {
  let imagesPreview = function (input, placeToInsertImagePreview) {
    if (input.files) {
      var filesAmount = input.files.length;

      for (i = 0; i < filesAmount; i++) {
        var reader = new FileReader();

        reader.onload = function (event) {
          $($.parseHTML("<img>"))
            .attr("src", event.target.result)
            .appendTo(placeToInsertImagePreview);
        };

        reader.readAsDataURL(input.files[i]);
      }
    }
  };

  $("#company_photo").on("change", function () {
    imagesPreview(this, "div.gallery");
  });
});

const isvalid = () => {
  let name = document.getElementById("name").value;
  let address = document.getElementById("address_one").value;
  let gstin = document.getElementById("gstin").value;
  let city = document.getElementById("city").value;
  // let pincode = document.getElementById("pincode").value;

  if (name === "" || gstin === "" || city === "" || address === "") {
    return false;
  } else {
    return true;
  }
};

// const btnSave = document.getElementById("btnSave");
let form = document.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log(isvalid());

  if (isvalid()) {
    let data = new FormData(form);
    let companyData = {
      prefix: "COMP",
      name: data.get("name").toUpperCase(),
      address_line_one: data.get("address_one").toUpperCase(),
      city: data.get("city").toUpperCase(),
      pincode: data.get("pincode"),
      state: data.get("state"),
      phone: data.get("phone"),
      mobile: data.get("mobile"),
      gstin: data.get("gstin").toUpperCase(),
      email: data.get("email"),
      pan: data.get("pan"),
      company_logo: data.get("company_photo").path,
    };
    console.log(companyData);

    axios
      .post(`http://localhost:3000/api/company`, companyData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});
//

// Fetch Company Info

function fetchCompanyInfo() {
  axios
    .get(`http://localhost:3000/api/company`)
    .then((response) => {
      let compData = response.data.data;
      console.log(compData);
      if (Object.keys(compData).length !== 0) {
        document.getElementById("name").value = compData.Name;

        var arrayBufferView = new Uint8Array(compData.Company_Logo.data);
        var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(blob);
        // var img = document.querySelector( "#photo" );
        // img.src = imageUrl;

        // var imageUrl = URL.createObjectURL(compData.Company_Logo.data);
        document.querySelector("#image").src = imageUrl;
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

const button = document.getElementById("newUser");
button.addEventListener("click", (event) => {
  ipcRenderer.send("create:user", "user");
});

const custButton = document.getElementById("newCustomer");
custButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:customerwindow", "customer");
});

const itemButton = document.getElementById("newItem");
itemButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:itemwindow", "item");
});

const supButton = document.getElementById("newSupplier");
supButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:supplierwindow", "supplier");
});

const invButton = document.getElementById("newInvoice");
invButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:invoiceWindow", "invoicetwo");
});

const payButton = document.getElementById("payment");
payButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:paymentWindow", "payment_account");
});

const repButton = document.getElementById("pdfReport");
repButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:reportWindow", "ledger_reports");
});

const tdsButton = document.getElementById("tdsReport");
tdsButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:tdsReportWindow", "tds_reports");
});

const jouButton = document.getElementById("journal");
jouButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:journalWindow", "journal");
});

const accButton = document.getElementById("account");
accButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:accountWindow", "account");
});

const backupButton = document.getElementById("dbbackup");
backupButton.addEventListener("click", (event) => {
  ipcRenderer.send("data:backup", "mysql_db");
});

const recButton = document.getElementById("receipt");
recButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:receiptWindow", "receive_account");
});

const msgButton = document.getElementById("messenger");
msgButton.addEventListener("click", (event) => {
  ipcRenderer.send("create:messengerWindow", "messenger");
});

const companyInfo = document.getElementById("companyInfo");
companyInfo.addEventListener("click", (event) => {
  $("#createTable").hide();
  $("#companyDetails").show();
  fetchCompanyInfo();
});

const ledgerButton = document.getElementById("ledger");
ledgerButton.addEventListener("click", (event) => {
  $("#companyDetails").hide();
  $("#createTable").show();
  $("table").remove();

  getLedgerListAPICall((response) => {
    if (response === "success") {
      generateLedgerDataTable();
      $("#datePanel").show();
    }
  });
});

const generalledgerButton = document.getElementById("generalledger");
generalledgerButton.addEventListener("click", (event) => {
  $("#companyDetails").hide();
  $("#createTable").show();
  $("table").remove();
  getGeneralLedgerListAPICall((response) => {
    if (response === "success") {
      generateGeneralLedgerDataTable();
    }
  });
});

const listPaymentButton = document.getElementById("listPayments");
listPaymentButton.addEventListener("click", (event) => {
  $("#companyDetails").hide();
  $("#createTable").show();
  $("table").remove();

  getPaymentListAPICall((response) => {
    if (response === "success") {
      generatePaymentDataTable();
    }
  });
});

const listReceiveButton = document.getElementById("listReceive");
listReceiveButton.addEventListener("click", (event) => {
  $("#companyDetails").hide();
  $("#createTable").show();
  $("table").remove();

  getReceiveListAPICall((response) => {
    if (response === "success") {
      generateReceiveDataTable();
    }
  });
});

const cusListButton = document.getElementById("cusList");
cusListButton.addEventListener("click", (event) => {
  $("#companyDetails").hide();
  $("#createTable").show();
  $("table").remove();
  generateCustomerDataTable();
});

const supListButton = document.getElementById("supList");
supListButton.addEventListener("click", (event) => {
  $("#companyDetails").hide();
  $("#createTable").show();
  $("table").remove();
  generateSupplierDataTable();
});

const itemListButton = document.getElementById("itemList");
itemListButton.addEventListener("click", (event) => {
  $("#companyDetails").hide();
  $("#createTable").show();
  $("table").remove();
  generateItemDataTable();
});

const invListButton = document.getElementById("invList");
invListButton.addEventListener("click", (event) => {
  $("#companyDetails").hide();
  $("#createTable").show();
  $("table").remove();

  generateInvoiceDataTable();
});

// Company Info

function generateCompanyInfo() { }

// No Records Found

function noRecordsFound(table) {
  document.getElementById(
    "createTable"
  ).innerHTML = `No ${table} records available`;
}

// Invoice DataTable

function generateInvoiceDataTable() {
  let invoiceId;
  let htmlTemplate = `<table id="invTable" class=" display table table-striped table-bordered dt-responsive nowrap" style="width:100%">
	<thead>
		<tr>
		<th>ID</th>
			<th>INVOICE NO.</th>
			<th>INVOICE DATE</th>
			<th>AGENT NAME</th>
      <th>AMOUNT</th>
			<th>GST AMOUNT</th>	   
      <th>NET AMOUNT</th>	   
		</tr>
	</thead> 
	</table>
`;
  document.getElementById("createTable").innerHTML = htmlTemplate;

  $("#invTable").dataTable({
    paging: true,
    sort: true,
    searching: true,
    responsive: true,
    processing: true,
    serverSide: true,
    ajax: "http://localhost:3000/api/invoicelist",
    language: {
      searchPlaceholder: "Search Invoice",
      sSearch: "",
      paginate: {
        next: "&#8594;", // or '→'
        previous: "&#8592;", // or '←'
      },
    },
    info: false,
    pageLength: 100,
    columnDefs: [
      {
        render: function (data, type, row) {
          return new Date(data).toLocaleDateString();
        },
        targets: 2,
      },
      {
        render: function (data, type, row) {
          return data.toFixed(2);
        },
        targets: 4,
      },
      {
        render: function (data, type, row) {
          return data.toFixed(2);
        },
        targets: 5,
      },
      {
        render: function (data, type, row) {
          return data.toFixed(2);
        },
        targets: 6,
      },
    ],

    dom: "Bfrtip",
    select: true,

    buttons: [
      {
        text: "Edit Selected Invoice",
        action: function (e, dt, node, config) {
          ipcRenderer.send("invoice:edit", {
            invoiceId: invoiceId,
          });
        },

        enabled: false,
      },
      {
        text: "Print Selected Invoice",
        action: function (e, dt, node, config) {
          printInvoicePdf(invoiceId);
        },

        enabled: false,
      },
    ],
  });

  //------------- Table row selection condition ------

  $("#invTable tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      $("#invTable").dataTable().$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
    }
  });

  $("#invTable tbody").on("click", "tr", function () {
    rowIndex = $("#invTable").DataTable().row(this).index();

    invoiceId = $("#invTable").DataTable().cell(".selected", 1).data();
    var selectedRows = $("tr.selected").length;
    $("#invTable")
      .DataTable()
      .button(0)
      .enable(selectedRows === 1);
    $("#invTable")
      .DataTable()
      .button(1)
      .enable(selectedRows === 1);
  });
}

// Ledger Datatable

function generateLedgerDataTable() {
  let invoiceId;
  let htmlTemplate = `<table id="ledTable" class=" display table table-striped table-bordered dt-responsive nowrap" style="width:100%">
	<thead>
		<tr>
		<th>ID</th>
			<th>AGENT NAME</th>
			<th>CITY</th>
			<th>CREDIT AMT..</th>
			<th>DEBIT AMT ..</th>
		 
		</tr>
	</thead> 
	</table>
`;
  document.getElementById("createTable").innerHTML = htmlTemplate;

  $("#ledTable").dataTable({
    paging: true,
    sort: true,
    searching: true,
    responsive: true,
    language: {
      searchPlaceholder: "Search records",
      sSearch: "",
      textPlaceholder: "Date range",
    },
    pageLength: 100,
    data: dataTableRecords,
    columns: [
      { data: "Acc" },
      { data: "first_name" },
      { data: "city" },
      { data: "Credit" },
      { data: "Debit" },
    ],
    dom: "Bfrtip",
    select: true,

    buttons: [
      {
        text: "Print Selected Ledger",
        action: function (e, dt, node, config) {
          printLedger(invoiceId);
        },

        enabled: false,
      },
    ],
  });

  $("#ledTable").one("preInit.dt", function () {
    $button = $("<a>go</a>");
    $("#ledTable_filter label").append($button);
    $button.button();
  });

  //Table row selection condition ------

  $("#ledTable tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      $("#ledTable").dataTable().$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
    }
  });

  $("#ledTable tbody").on("click", "tr", function () {
    rowIndex = $("#ledTable").DataTable().row(this).index();

    invoiceId = $("#ledTable").DataTable().cell(".selected", 0).data();
    var selectedRows = $("tr.selected").length;
    $("#ledTable")
      .DataTable()
      .button(0)
      .enable(selectedRows === 1);
  });
}
// General Ledger

function generateGeneralLedgerDataTable() {
  let rowIndex;
  let invoiceId;
  let htmlTemplate = `<table id="genTable" class=" display table table-striped table-bordered dt-responsive nowrap" style="width:100%">
	<thead>
		<tr>
		<th>ID</th>
			<th>ACCOUNT NAME</th>		
			<th>CREDIT AMT..</th>
			<th>DEBIT AMT ..</th>
		 
		</tr>
	</thead> 
	</table>
`;
  document.getElementById("createTable").innerHTML = htmlTemplate;

  $("#genTable").dataTable({
    paging: true,
    sort: true,
    searching: true,
    responsive: true,
    language: {
      searchPlaceholder: "Search records",
      sSearch: "",
    },
    pageLength: 100,
    data: dataTableRecords,
    columns: [
      { data: "Acc" },
      { data: "Account_Name" },
      { data: "Credit" },
      { data: "Debit" },
    ],
    dom: "Bfrtip",
    select: true,

    buttons: [
      {
        text: "Print Selected Ledger",
        action: function (e, dt, node, config) {
          printLedger(invoiceId);
        },

        enabled: false,
      },
    ],
  });

  //Table row selection condition ------

  $("#genTable tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      $("#genTable").dataTable().$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
    }
  });

  $("#genTable tbody").on("click", "tr", function () {
    rowIndex = $("#genTable").DataTable().row(this).index();

    invoiceId = $("#genTable").DataTable().cell(".selected", 0).data();
    var selectedRows = $("tr.selected").length;
    $("#genTable")
      .DataTable()
      .button(0)
      .enable(selectedRows === 1);
  });
}

// Customer DataTable

function generateCustomerDataTable() {
  let cusID;
  const htmlTemplate = `<table id="cusTable" class=" display table table-striped table-bordered dt-responsive nowrap" style="width:100%">
			<thead>
				<tr>
					<th>ID</th>
					<th>AGENT NAME</th>
					<th>CITY</th>
					<th>STATE</th>
					<th>GSTIN</th>	   
				</tr>
			</thead> 
		</table>
	`;

  document.getElementById("createTable").innerHTML = htmlTemplate;

  $("#cusTable").dataTable({
    paging: true,
    sort: true,
    searching: true,
    responsive: true,
    processing: true,
    serverSide: true,
    ajax: "http://localhost:3000/api/customerlist",
    language: {
      searchPlaceholder: "Search Customer",
      sSearch: "",
      paginate: {
        next: "&#8594;", // or '→'
        previous: "&#8592;", // or '←'
      },
    },
    info: false,
    pageLength: 100,
    dom: "Bfrtip",
    select: true,

    buttons: [
      {
        text: "Edit Selected Customer",
        action: function (e, dt, node, config) {
          ipcRenderer.send("customer:edit", {
            cusID: cusID,
          });
        },

        enabled: false,
      },
    ],
  });

  //------------- Table row selection condition ------

  $("#cusTable tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      $("#cusTable").dataTable().$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
    }
  });

  $("#cusTable tbody").on("click", "tr", function () {
    rowIndex = $("#cusTable").DataTable().row(this).index();

    cusID = $("#cusTable").DataTable().cell(".selected", 0).data();

    var selectedRows = $("tr.selected").length;
    $("#cusTable")
      .DataTable()
      .button(0)
      .enable(selectedRows === 1);
  });
}

// Supplier DataTable

function generateSupplierDataTable() {
  let supID;
  const htmlTemplate = `<table id="supTable" class=" display table table-striped table-bordered dt-responsive nowrap" style="width:100%">
			<thead>
				<tr>
					<th>ID</th>
					<th>SUPPLIER NAME</th>
					<th>CITY</th>
					<th>STATE</th>
					<th>GSTIN</th>	   
				</tr>
			</thead> 
		</table>
	`;

  document.getElementById("createTable").innerHTML = htmlTemplate;

  $("#supTable").dataTable({
    paging: true,
    sort: true,
    searching: true,
    responsive: true,
    processing: true,
    serverSide: true,
    ajax: "http://localhost:3000/api/suppliers",
    language: {
      searchPlaceholder: "Search Supplier",
      sSearch: "",
    },
    pageLength: 100,

    // data: dataTableRecords,

    // columns: [
    // 	{ data: "id" },
    // 	{ data: "first_name" },
    // 	{ data: "city" },
    // 	{ data: "State_Name" },
    // 	{ data: "gstin" },
    // ],
    dom: "Bfrtip",
    select: true,

    buttons: [
      {
        text: "Edit Selected Supplier",
        action: function (e, dt, node, config) {
          ipcRenderer.send("supplier:edit", {
            supID: supID,
          });
        },

        enabled: false,
      },
    ],
  });

  //------------- Table row selection condition ------

  $("#supTable tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      $("#supTable").dataTable().$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
    }
  });

  $("#supTable tbody").on("click", "tr", function () {
    rowIndex = $("#supTable").DataTable().row(this).index();

    supID = $("#supTable").DataTable().cell(".selected", 0).data();

    var selectedRows = $("tr.selected").length;
    $("#supTable")
      .DataTable()
      .button(0)
      .enable(selectedRows === 1);
  });
}

// Item DataTable

function generateItemDataTable() {
  let itemID;
  const htmlTemplate = `<table id="itemTable" class=" display table table-striped table-bordered dt-responsive nowrap" style="width:100%">
			<thead>
				<tr>
					<th>ID</th>
					<th>ITEM NAME</th>
          <th>HSN CODE</th>
					<th>UNIT PRICE</th>
					<th>GST RATE</th>
				
				</tr>
			</thead> 
		</table>
	`;

  document.getElementById("createTable").innerHTML = htmlTemplate;

  $("#itemTable").dataTable({
    paging: true,
    sort: true,
    searching: true,
    responsive: true,
    processing: true,
    serverSide: true,
    ajax: "http://localhost:3000/api/items",
    language: {
      searchPlaceholder: "Search Item",
      sSearch: "",
      paginate: {
        next: "&#8594;", // or '→'
        previous: "&#8592;", // or '←'
      },
    },
    info: false,
    pageLength: 100,
    dom: "Bfrtip",
    select: true,
    buttons: [
      {
        text: "Edit Selected Item",
        action: function (e, dt, node, config) {
          ipcRenderer.send("item:edit", {
            itemID: itemID,
          });
        },

        enabled: false,
      },
    ],
  });

  //------------- Table row selection condition ------

  $("#itemTable tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      $("#itemTable").dataTable().$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
    }
  });

  $("#itemTable tbody").on("click", "tr", function () {
    rowIndex = $("#itemTable").DataTable().row(this).index();

    itemID = $("#itemTable").DataTable().cell(".selected", 0).data();

    var selectedRows = $("tr.selected").length;
    $("#itemTable")
      .DataTable()
      .button(0)
      .enable(selectedRows === 1);
  });
}

// Generate Payment DataTable

function generatePaymentDataTable() {
  let rowIndex;
  let paymentId;
  let entryType;
  let htmlTemplate = `<table id="payTable" class=" display table table-striped table-bordered dt-responsive nowrap" style="width:100%">
	<thead>
		<tr>
		<th>ID</th>
			<th>ENTRY DATE</th>
			<th>ENTRY TYPE</th>
			<th>ACCOUNT NAME</th>
			<th>CHEQUE NO.</th>
			<th>AMOUNT</th>
		 
		</tr>
	</thead> 
	</table>
`;
  document.getElementById("createTable").innerHTML = htmlTemplate;

  $("#payTable").dataTable({
    paging: true,
    sort: true,
    searching: true,
    responsive: true,
    language: {
      searchPlaceholder: "Search records",
      sSearch: "",
    },
    pageLength: 100,
    data: dataTableRecords,
    columnDefs: [
      {
        render: function (data, type, row) {
          return new Date(data).toLocaleDateString();
        },
        targets: 1,
      },
    ],
    columns: [
      { data: "id" },
      { data: "EntryDate" },
      { data: "EntryType" },
      {
        data: function (row, type, val, meta) {
          if (row.Account_Name === null) {
            return row.first_name;
          } else {
            return row.Account_Name;
          }
        },
      },
      { data: "ChequeNumber" },
      { data: "Debit_Amount" },
    ],
    dom: "Bfrtip",
    select: true,

    buttons: [
      {
        text: "Edit Selected Entry",
        action: function (e, dt, node, config) {
          if (
            entryType === "CASH-TRANSACTION" ||
            entryType === "BANK-TRANSACTION"
          ) {
            ipcRenderer.send("journal:edit", {
              paymentId: paymentId,
            });
          } else {
            ipcRenderer.send("payment:edit", {
              paymentId: paymentId,
            });
          }
        },

        enabled: false,
      },
    ],
  });

  //Table row selection condition ------

  $("#payTable tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      $("#payTable").dataTable().$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
    }
  });

  $("#payTable tbody").on("click", "tr", function () {
    rowIndex = $("#payTable").DataTable().row(this).index();

    paymentId = $("#payTable").DataTable().cell(".selected", 0).data();
    entryType = $("#payTable").DataTable().cell(".selected", 2).data();
    var selectedRows = $("tr.selected").length;
    $("#payTable")
      .DataTable()
      .button(0)
      .enable(selectedRows === 1);
  });
}

// Receive table List

function generateReceiveDataTable() {
  let rowIndex;
  let paymentId;
  let htmlTemplate = `<table id="recTable" class=" display table table-striped table-bordered dt-responsive nowrap" style="width:100%">
	<thead>
		<tr>
		<th>ID</th>
			<th>ENTRY DATE</th>
			<th>ENTRY TYPE</th>
			<th>ACCOUNT NAME</th>
			<th>CHEQUE NO.</th>
			<th>AMOUNT</th>
		 
		</tr>
	</thead> 
	</table>
`;
  document.getElementById("createTable").innerHTML = htmlTemplate;

  $("#recTable").dataTable({
    paging: true,
    sort: true,
    searching: true,
    responsive: true,
    language: {
      searchPlaceholder: "Search records",
      sSearch: "",
    },
    pageLength: 100,
    data: dataTableRecords,
    columnDefs: [
      {
        render: function (data, type, row) {
          return new Date(data).toLocaleDateString();
        },
        targets: 1,
      },
    ],
    columns: [
      { data: "id" },
      { data: "EntryDate" },
      { data: "EntryType" },
      {
        data: function (row, type, val, meta) {
          if (row.Account_Name === null) {
            return row.first_name;
          } else {
            return row.Account_Name;
          }
        },
      },
      { data: "ChequeNumber" },
      { data: "Credit_Amount" },
    ],
    dom: "Bfrtip",
    select: true,

    buttons: [
      {
        text: "Edit Selected Entry",
        action: function (e, dt, node, config) {
          ipcRenderer.send("receive:edit", {
            paymentId: paymentId,
          });
        },

        enabled: false,
      },
    ],
  });

  //Table row selection condition ------

  $("#recTable tbody").on("click", "tr", function () {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
    } else {
      $("#recTable").dataTable().$("tr.selected").removeClass("selected");
      $(this).addClass("selected");
    }
  });

  $("#recTable tbody").on("click", "tr", function () {
    rowIndex = $("#recTable").DataTable().row(this).index();

    paymentId = $("#recTable").DataTable().cell(".selected", 0).data();
    var selectedRows = $("tr.selected").length;
    $("#recTable")
      .DataTable()
      .button(0)
      .enable(selectedRows === 1);
  });
}

ipcRenderer.on("backup:done", (event, args) => {
  alert(args);
});
