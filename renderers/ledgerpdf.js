// Generate Agent Ledger Date Range

const agentLedgerAPICallDateWise = (id) => {
  return axios
    .post(
      `http://localhost:3000/api/ledgerpdfdatewise/${id}`,
      {
        from: fromDate,
        to: toDate,
      },

      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {

      return response.data;
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
};

function printAgentLedgerPdf(id) {
  agentLedgerAPICallDateWise(id).then(async (results) => {
    console.log(results)
    if (results.message === "success") {
      let data = results.data;
      console.log(data)
      let agentData = data;
      // console.log(agentData[0].first_name);

      // let templateHtml = fs.readFileSync(
      //   path.join(app.getAppPath(), "../build/ledgertemplate.html"),
      //   "utf8"
      // );

      let templateHtml = fs.readFileSync(
        path.join(__dirname, "../build/ledgertemplate.html"),
        "utf8"
      );

      let template = handlebars.compile(templateHtml);
      let html = template(data);
      const pdfPath = `C://PDF_REPORTS//${agentData[0].first_name} LEDGER.pdf`;
      let options = {
        printBackground: true,
        path: pdfPath,
        format: "A4",
      };
      const browser = await puppeteer.launch({
        headless: true,
        // executablePath: path.join(
        //   app.getAppPath(),
        //   "../app.asar.unpacked/node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
        // ),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      let page = await browser.newPage();
      await page.setContent(html);
      await page.pdf(options);
      await browser.close();
      alert("LEDGER GENERATED");
    }
  });
}

// Generate General ledger date range

const generalLedgerAPICallDateWise = (id) => {
  return axios
    .post(
      `http://localhost:3000/api/generalledger/${id}`,
      {
        from: fromDate,
        to: toDate,
      },

      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
};

function printGeneralLedgerPdf(id) {
  generalLedgerAPICallDateWise(id).then(async (results) => {
    if (results.message === "success") {
      let data = results.data;

      let accNameEntry = document.getElementById("accountList");
      let accName = accNameEntry.options[accNameEntry.selectedIndex].text;

      // let templateHtml = fs.readFileSync(
      //   path.join(app.getAppPath(), "../build/generalledgertemplate.html"),
      //   "utf8"
      // );

      let templateHtml = fs.readFileSync(
        path.join(__dirname, "../build/generalledgertemplate.html"),
        "utf8"
      );

      let template = handlebars.compile(templateHtml);
      let html = template(data);
      const pdfPath = `C://PDF_REPORTS//${accName} LEDGER.pdf`;
      let options = {
        printBackground: true,
        path: pdfPath,
        format: "A4",
      };
      const browser = await puppeteer.launch({
        headless: true,
        // executablePath: path.join(
        //   app.getAppPath(),
        //   "../app.asar.unpacked/node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
        // ),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      let page = await browser.newPage();
      await page.setContent(html);
      await page.pdf(options);
      await browser.close();
      alert("LEDGER GENERATED");
    }
  });
}

// Print General Ledger

const printLedgerAPICall = (id) => {
  return axios
    .get(`http://localhost:3000/api/ledgerpdf/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
};

function printLedger(accountId) {
  printLedgerAPICall(accountId).then(async (results) => {
    if (results.message === "success") {
      let data = results.data;
      // let templateHtml = fs.readFileSync(
      //   path.join(app.getAppPath(), "../build/ledgertemplate.html"),
      //   "utf8"
      // );

      let templateHtml = fs.readFileSync(
        path.join(__dirname, "../build/ledgertemplate.html"),
        "utf8"
      );

      let template = handlebars.compile(templateHtml);
      let html = template(data);

      const pdfPath = `C://PDF_REPORTS//Ledger.pdf`;

      let options = {
        printBackground: true,
        path: pdfPath,
        format: "A4",
      };

      const browser = await puppeteer.launch({
        headless: true,
        // executablePath: path.join(
        //   app.getAppPath(),
        //   "../app.asar.unpacked/node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
        // ),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      let page = await browser.newPage();
      await page.setContent(html);

      await page.pdf(options);
      await browser.close();

      alert("LEDGER GENERATED");
    }
  });
}

// Ledger for all customers

const allAgentLedgerAPICallDateWise = () => {
  return axios
    .post(
      `http://localhost:3000/api/ledgerpdfdatewise`,
      {
        from: fromDate,
        to: toDate,
      },

      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
};

function printAllAgentsLedgerPdf() {
  allAgentLedgerAPICallDateWise().then(async (results) => {
    if (results.message === "success") {
      let data = results.data;

      // let templateHtml = fs.readFileSync(
      //   path.join(app.getAppPath(), "../build/allledgertemplate.html"),
      //   "utf8"
      // );

      let templateHtml = fs.readFileSync(
        path.join(__dirname, "../build/allledgertemplate.html"),
        "utf8"
      );

      let template = handlebars.compile(templateHtml);
      let html = template(data);

      const pdfPath = `C://PDF_REPORTS//LEDGER.pdf`;

      let options = {
        printBackground: true,
        path: pdfPath,
        format: "A4",
      };

      const browser = await puppeteer.launch({
        headless: true,
        // executablePath: path.join(
        //   app.getAppPath(),
        //   "../app.asar.unpacked/node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
        // ),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      let page = await browser.newPage();
      await page.setContent(html);

      await page.pdf(options);
      await browser.close();

      alert("LEDGER GENERATED");
    }
  });
}
