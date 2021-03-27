const electron = require("electron");
const { app, BrowserWindow, Menu, ipcMain, screen, shell } = electron;
const express = require(__dirname + "/api/app");
const url = require("url");
const axios = require("axios");
const path = require("path");
const EOL = require("os").EOL;
const fs = require("fs");
const storage = require("electron-json-storage");
const { exec } = require("child_process");
const { CloudWatchLogs } = require("aws-sdk");

let CWD = process.cwd();
let dataPath = null;
let mainWindow = null;
let loginWindow = null;

global.sharedObject = {
  someProperty: "",
};

var menu = Menu.buildFromTemplate([
  {
    label: "Menu",
    submenu: [
      {
        label: "Home",
        click() {
          mainWindow.loadURL(
            url.format({
              pathname: path.join(__dirname, "renderers/index.html"),
              protocol: "file:",
              slashes: true,
            })
          );
        },
      },

      {
        label: "Website",
        click() {
          mainWindow.loadURL("http://cruisecarrot.com/");
        },
      },
      {
        label: "Currency Exchange",
        click() {
          shell.openExternal(
            "https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=INR"
          );
        },
        accelerator: "CmdOrCtrl+Shift+C",
      },
      { type: "separator" },
      {
        label: "Exit",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Info",
  },
]);

Menu.setApplicationMenu(menu);

async function getWeatherData() {
  await axios
    .get(
      `http://api.openweathermap.org/data/2.5/weather?q=delhi,IN&APPID=1e2e7f5d7c3e08e9dc1b2504463f9d59`
    )
    .then((response) => {
      console.log(response.data.main);

      global.sharedObject.someProperty = `${response.data.main.temp}`;
    });
}

const loginAPICall = async (loginData) => {
  return await axios
    .post(`http://localhost:3000/api/signin`, loginData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

ipcMain.on("login:request", (event, args) => {
  const dataPath = path.join(storage.getDataPath(), "../storage");

  storage.setDataPath(dataPath);

  loginAPICall(args).then((data) => {
    if (data.message === "User does not exists, Contact Admin !") {
      event.reply("login:response", data.message);
    } else {
      storage.set(
        "userlogin",
        {
          name: data.name,
          email: data.email,
          token: data.token,
          role: data.role,
        },
        function (error) {
          if (error) throw error;
        }
      );

      event.reply("login:response", data.message);
    }
  });
});

ipcMain.on("logout:request", (event) => {
  createLoginWindow();
});

// HOME WINDOW

function createHomeWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const modalPath = path.join(`file://${__dirname}/renderers/index.html`);

  mainWindow = new BrowserWindow({
    resizable: false,
    height: height,
    width: width,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.webContents.openDevTools();

  mainWindow.loadURL(modalPath);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

ipcMain.on("home:window", (event) => {
  createHomeWindow();
});

// LOGIN WINDOW

function createLoginWindow() {
  const display = screen.getPrimaryDisplay();
  const maxiSize = display.workAreaSize;

  loginWindow = new BrowserWindow({
    resizable: false,
    height: maxiSize.height,
    width: maxiSize.width,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  loginWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "renderers/login.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  //	Open DevTools - Remove for PRODUCTION!
  // loginWindow.webContents.openDevTools();
  // Listen for window being closed

  loginWindow.on("closed", () => {
    loginWindow = null;
  });
}

// Fetching Users records --
const userData = async () => {
  return await axios
    .get(`http://localhost:3000/api/users`)
    .then((Response) => {
      // console.log(Response.data.data);
      return Response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// userData().then((data) => {
// 	mainWindow.webContents.on("did-finish-load", (event) => {
// 		mainWindow.webContents.send("fetchUsers", data);
// 	});
// });

// Fetching Customers records --

const customerData = async () => {
  return await axios
    .get(`http://localhost:3000/api/fetchcustomeraccount`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// customerData().then((data) => {
// 	mainWindow.webContents.on("did-finish-load", (event) => {
// 		mainWindow.webContents.send("fetchCustomers", data);
// 	});
// });

// Fetch account category

const accountCategory = async () => {
  return await axios
    .get(`http://localhost:3000/api/categories`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

//Fetch Accounts Data

const accountData = async () => {
  return await axios
    .get(`http://localhost:3000/api/accounts`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// Fetch States

const statesData = async () => {
  return await axios
    .get(`http://localhost:3000/api/states`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// Fetch Invoice Number

const getInvoiceNumber = async () => {
  return await axios
    .get(`http://localhost:3000/api/getinvoice`)
    .then((Response) => {
      return Response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// ipcMain.on("add:customer", async function (event, args) {
// 	console.log(args);
// 	await axios
// 		.post(
// 			`http://localhost:3000/api/customer`,
// 			args,

// 			{
// 				headers: {
// 					Accept: "application/json",
// 					"Content-Type": "application/json",
// 				},
// 			}
// 		)
// 		.then((Response) => {
// 			event.reply("customer:added", Response.data.message);
// 		})
// 		.catch((error) => {
// 			event.reply("customer:added", error.response.data.message);
// 		});
// });

ipcMain.on("update:customer", async function (event, args) {
  console.log(args);
  await axios
    .put(
      `http://localhost:3000/api/customer`,
      args,

      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
    .then((Response) => {
      event.reply("customer:updated", Response.data.message);
    })
    .catch((error) => {
      event.reply("customer:updated", error.response.data.message);
    });
});

// Customer Edit

const fetchCustomerDataByID = async (id) => {
  return await axios
    .get(`http://localhost:3000/api/customer/${id}`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

ipcMain.on("customer:edit", function (event, args) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/customer_edit.html`
  );

  let cuseditWindow = new BrowserWindow({
    resizable: false,
    height: 630,
    width: width - 350,
    frame: false,
    title: "Edit Customer",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // console.log(args.cusID);
  // cuseditWindow.webContents.openDevTools();

  cuseditWindow.loadURL(modalPath);

  cuseditWindow.webContents.on("did-finish-load", (event) => {
    statesData().then((data) => {
      cuseditWindow.webContents.send("fetchStates", data);
    });

    fetchCustomerDataByID(args.cusID.slice(-1)).then((cusData) => {
      cuseditWindow.webContents.send("sendCustomerDataForEdit", cusData);
    });
  });

  cuseditWindow.on("closed", () => {
    cuseditWindow = null;
  });
});

// Supplier Edit

const fetchSupplierDataByID = async (id) => {
  return await axios
    .get(`http://localhost:3000/api/supplier/${id}`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

ipcMain.on("supplier:edit", function (event, args) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/supplier_edit.html`
  );

  let cuseditWindow = new BrowserWindow({
    resizable: false,
    height: 630,
    width: width - 350,
    frame: false,
    title: "Edit Supplier",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // console.log(args.cusID);
  // cuseditWindow.webContents.openDevTools();

  cuseditWindow.loadURL(modalPath);

  cuseditWindow.webContents.on("did-finish-load", (event) => {
    statesData().then((data) => {
      cuseditWindow.webContents.send("fetchStates", data);
    });

    fetchSupplierDataByID(args.supID.slice(-1)).then((cusData) => {
      cuseditWindow.webContents.send("sendSupplierDataForEdit", cusData);
    });
  });

  cuseditWindow.on("closed", () => {
    cuseditWindow = null;
  });
});

// Payment Edit

// ipcMain.on("close:window", (event, args) => {
// 	args.close();

// 	args.on("closed", () => {
// 		customerWindow = null;
// 	});
// });

// Customer Window

ipcMain.on("create:customerwindow", (event, fileName) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let win = new BrowserWindow({
    resizable: false,
    height: 630,
    width: width - 350,
    frame: false,
    title: "Add Customer",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // win.webContents.openDevTools();

  win.loadURL(modalPath);

  win.webContents.on("did-finish-load", (event) => {
    statesData().then((data) => {
      win.webContents.send("fetchStates", data);
    });
  });

  win.on("closed", () => {
    win = null;
  });
});

// Supplier Window

ipcMain.on("create:supplierwindow", (event, fileName) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let win = new BrowserWindow({
    resizable: false,
    height: 630,
    width: width - 350,
    frame: false,
    title: "Add Supplier",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // win.webContents.openDevTools();

  win.loadURL(modalPath);

  win.webContents.on("did-finish-load", (event) => {
    statesData().then((data) => {
      win.webContents.send("fetchStates", data);
    });
  });

  win.on("closed", () => {
    win = null;
  });
});

// Messenger Window

ipcMain.on("create:messengerWindow", (event, fileName) => {
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let win = new BrowserWindow({
    resizable: false,
    height: 320,
    width: 600,
    frame: false,
    title: "messenger",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // win.webContents.openDevTools();

  win.loadURL(modalPath);

  win.on("closed", () => {
    win = null;
  });
});

// Report Window

ipcMain.on("create:reportWindow", (event, fileName) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let win = new BrowserWindow({
    resizable: false,
    height: 510,
    width: 600,
    frame: false,
    title: "Reports",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  win.webContents.openDevTools();

  win.loadURL(modalPath);

  win.on("closed", () => {
    win = null;
  });
});

// Item Window

ipcMain.on("create:itemwindow", (event, fileName) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let win = new BrowserWindow({
    resizable: false,
    height: 410,
    width: 600,
    frame: false,
    title: "Reports",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // win.webContents.openDevTools();

  win.loadURL(modalPath);

  win.on("closed", () => {
    win = null;
  });
});

// Item edit window

const fetchItemDataByID = async (id) => {
  return await axios
    .get(`http://localhost:3000/api/item/${id}`)
    .then((response) => {
      console.log(response.data);
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

ipcMain.on("item:edit", (event, args) => {
  console.log(args);
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(`file://${__dirname}/renderers/item_edit.html`);

  let win = new BrowserWindow({
    resizable: false,
    height: 510,
    width: 600,
    frame: false,
    title: "Item",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  win.webContents.openDevTools();

  win.loadURL(modalPath);

  win.webContents.on("did-finish-load", (event) => {
    fetchItemDataByID(args.itemID).then((itemData) => {
      win.webContents.send("sendItemDataForEdit", itemData);
    });
  });

  win.on("closed", () => {
    win = null;
  });
});

// Tds window

ipcMain.on("create:tdsReportWindow", (event, fileName) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let win = new BrowserWindow({
    resizable: false,
    height: 510,
    width: 600,
    frame: false,
    title: "Reports",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // win.webContents.openDevTools();

  win.loadURL(modalPath);

  win.on("closed", () => {
    win = null;
  });
});

ipcMain.on("create:invoiceWindow", (event, fileName) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let win = new BrowserWindow({
    resizable: false,
    height: 700,
    width: width - 66,
    frame: false,
    title: "Add Invoice",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  win.webContents.openDevTools();

  win.loadURL(modalPath);

  win.webContents.on("did-finish-load", (event) => {
    customerData().then((data) => {
      win.webContents.send("fetchCustomers", data);
    });
    getInvoiceNumber().then((inv) => {
      win.webContents.send("sendInvoiceNumber", inv);
    });
  });

  win.on("closed", () => {
    win = null;
  });
});

// Invoice edit window


const fetchItemNames = async () => {
  return await axios
    .get(`http://localhost:3000/api/fetchitemnames`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      alert(error.data.message);
    });
}


const fetchInvoiceDataByID = async (id) => {
  console.log(id);
  return await axios
    .get(`http://localhost:3000/api/invoice/${id}`)
    .then((response) => {
      console.log(response.data)
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

ipcMain.on("invoice:edit", (event, args) => {
  // console.log(args);
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/invoicetwo_edit.html`
  );

  let inveditWin = new BrowserWindow({
    resizable: false,
    height: 700,
    width: width - 66,
    frame: false,
    title: "Edit Invoice",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  inveditWin.webContents.openDevTools();

  inveditWin.loadURL(modalPath);

  inveditWin.webContents.on("did-finish-load", (event) => {
    customerData().then((data) => {
      inveditWin.webContents.send("fetchCustomers", data);
    });
    fetchItemNames().then((data) => {
      console.log(data)
      inveditWin.webContents.send("fetchItems", data);
    });

    fetchInvoiceDataByID(args.invoiceId).then((invData) => {
      inveditWin.webContents.send("sendInvoiceDataForEdit", invData);
    });
  });
});

// Invoice window

ipcMain.on("add:invoice", async function (event, args) {
  await axios
    .post(
      `http://localhost:3000/api/invoice`,
      args,

      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
    .then((Response) => {
      event.reply("invoice:added", Response.data.message);
    })
    .catch((error) => {
      event.reply("invoice:added", error.response.data.message);
    });
});

// Payment window

ipcMain.on("create:paymentWindow", (event, fileName) => {
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let pWin = new BrowserWindow({
    resizable: false,
    height: 500,
    width: 900,
    frame: false,
    title: "Payment",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // pWin.webContents.openDevTools();

  pWin.loadURL(modalPath);

  pWin.webContents.on("did-finish-load", (event) => {
    customerData().then((data) => {
      pWin.webContents.send("fetchCustomers", data);
    });

    accountData().then((args) => {
      // console.log(args);
      pWin.webContents.send("fetchAccounts", args);
    });
  });
});

// Payment edit window

const fetchPaymentDataByID = async (id) => {
  return await axios
    .get(`http://localhost:3000/api/payment/${id}`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

ipcMain.on("payment:edit", function (event, args) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/payment_edit.html`
  );

  let payeditWin = new BrowserWindow({
    resizable: false,
    height: 500,
    width: 900,
    frame: false,
    title: "Payment",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // console.log(args.paymentId);
  // payeditWin.webContents.openDevTools();

  payeditWin.loadURL(modalPath);

  payeditWin.webContents.on("did-finish-load", (event) => {
    customerData().then((data) => {
      payeditWin.webContents.send("fetchCustomers", data);
    });

    accountData().then((args) => {
      payeditWin.webContents.send("fetchAccounts", args);
    });

    fetchPaymentDataByID(args.paymentId).then((payData) => {
      payeditWin.webContents.send("sendPaymentDataForEdit", payData[0]);
    });
  });

  payeditWin.on("closed", () => {
    payeditWin = null;
  });
});

// Receive edit window

const fetchReceiveDataByID = async (id) => {
  return await axios
    .get(`http://localhost:3000/api/receive/${id}`)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

ipcMain.on("receive:edit", function (event, args) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/receive_edit.html`
  );

  let payeditWin = new BrowserWindow({
    resizable: false,
    height: 500,
    width: 900,
    frame: false,
    title: "Receive",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // console.log(args.paymentId);
  // payeditWin.webContents.openDevTools();

  payeditWin.loadURL(modalPath);

  payeditWin.webContents.on("did-finish-load", (event) => {
    customerData().then((data) => {
      payeditWin.webContents.send("fetchCustomers", data);
    });

    accountData().then((args) => {
      payeditWin.webContents.send("fetchAccounts", args);
    });

    fetchReceiveDataByID(args.paymentId).then((payData) => {
      payeditWin.webContents.send("sendReceiveDataForEdit", payData[0]);
    });
  });

  payeditWin.on("closed", () => {
    payeditWin = null;
  });
});

// Journal edit window

const fetchJournalDataByID = async (id) => {
  return await axios
    .get(`http://localhost:3000/api/journal/${id}`)
    .then((response) => {
      //  console.log(response.data);
      return response.data.data;
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

ipcMain.on("journal:edit", function (event, args) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const modalPath = path.join(
    `file://${__dirname}/renderers/journal_edit.html`
  );

  let jeditWin = new BrowserWindow({
    resizable: false,
    height: 500,
    width: 900,
    frame: false,
    title: "Journal",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // console.log(args.paymentId);
  // jeditWin.webContents.openDevTools();

  jeditWin.loadURL(modalPath);

  jeditWin.webContents.on("did-finish-load", (event) => {
    accountData().then((args) => {
      jeditWin.webContents.send("fetchAccounts", args);
    });

    fetchJournalDataByID(args.paymentId).then((payData) => {
      //   console.log(payData);
      jeditWin.webContents.send("sendJournalDataForEdit", payData[0]);
    });
  });

  jeditWin.on("closed", () => {
    jeditWin = null;
  });
});

// Journal window

ipcMain.on("create:journalWindow", (event, fileName) => {
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let jWin = new BrowserWindow({
    resizable: false,
    height: 500,
    width: 900,
    frame: false,
    title: "Journal",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // jWin.webContents.openDevTools();

  jWin.loadURL(modalPath);

  jWin.webContents.on("did-finish-load", (event) => {
    accountData().then((args) => {
      //  console.log(args);
      jWin.webContents.send("fetchAccounts", args);
    });
  });

  jWin.on("closed", () => {
    jWin = null;
  });
});

// Receipt window

ipcMain.on("create:receiptWindow", (event, fileName) => {
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let rWin = new BrowserWindow({
    resizable: false,
    height: 500,
    width: 900,
    frame: false,
    title: "Payment",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // rWin.webContents.openDevTools();

  rWin.loadURL(modalPath);

  rWin.webContents.on("did-finish-load", (event) => {
    customerData().then((data) => {
      rWin.webContents.send("fetchCustomers", data);
    });

    // accountData().then((args) => {
    //   //  console.log(args);
    //   rWin.webContents.send("fetchAccounts", args);
    // });
  });
});

// Account window

ipcMain.on("create:accountWindow", (event, fileName) => {
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let aWin = new BrowserWindow({
    resizable: false,
    height: 530,
    width: 700,
    frame: false,
    title: "Account",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // aWin.webContents.openDevTools();

  aWin.loadURL(modalPath);

  aWin.webContents.on("did-finish-load", (event) => {
    accountCategory().then((data) => {
      aWin.webContents.send("accountCategory", data);
    });
  });

  aWin.on("closed", () => {
    aWin = null;
  });
});

// User window

ipcMain.on("create:user", (event, fileName) => {
  const modalPath = path.join(
    `file://${__dirname}/renderers/` + fileName + `.html`
  );

  let aWin = new BrowserWindow({
    resizable: false,
    height: 480,
    width: 700,
    frame: false,
    title: "User",
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  // aWin.webContents.openDevTools();

  aWin.loadURL(modalPath);

  aWin.on("closed", () => {
    aWin = null;
  });
});

ipcMain.on("fetchCustomers", (event, args) => {
  customerData().then((data) => {
    event.reply("customerData", data);
  });
});

ipcMain.on("data:backup", (event, args) => {
  // var wstream = fs.createWriteStream(path.join(__dirname, "dumpfilename.sql"));
  // var child = spawn("mysqldump", ["-u", "root", "-praj2neo", "shipping"]);
  // child.stdout.pipe(wstream).on("finish", function () {
  // 	console.log("Completed");
  // });
  // .on("error", function (err) {
  // 	console.log(err);
  // });
  // let date = new Date();
  // const child = exec(
  // 	`mysqldump -u root -p[raj2neo] [shipping] > ${date.getDate()}-datadump.sql`
  // );
  // child.stdout.pipe();
  // console.log(child);
  // event.reply("backup:done", "DATA BACKUP DONE ");
});

// Electron App is ready
app.on("ready", () => {
  dataPath = path.join(storage.getDataPath(), "../storage");
  storage.setDataPath(dataPath);

  storage.get("userlogin", function (error, data) {
    if (error) throw error;

    if (Object.keys(data).length === 0) {
      createLoginWindow();
    } else {
      createHomeWindow();
    }
  });
});

// Quit when all windows are closed - (Not macOS - Darwin)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// app.on("before-quit", (event) => {
//   process.kill(process.pid, "SIGTERM");
// });

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on("activate", () => {
  const dataPath = path.join(storage.getDataPath(), "../Local Storage/leveldb");
  storage.setDataPath(dataPath);

  storage.get("userlogin", function (error, data) {
    if (error) throw error;

    console.log(data);
  });

  // if (mainWindow === null) createWindow();
});

process.on("uncaughtException", (err) => {
  appLog("error", `Uncaught error: ${err.stack}`);
  throw err;
});

// executable there is no console to see logs
function appLog(level, message) {
  const origMsg = message;

  message += EOL;

  if (level === "info") {
    console.log(origMsg);
    fs.appendFileSync(path.join(CWD, "app-info-shipping.log"), message);
  } else if (level === "error") {
    console.error(origMsg);
    fs.appendFileSync(path.join(CWD, "app-error-shipping.log"), message);
  }
}
