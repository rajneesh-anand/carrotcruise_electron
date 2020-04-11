const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const expValidator = require("express-validator");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(bodyParser.json());
app.use(expValidator());

const customerRouter = require(__dirname + "/routes/customer");
const userRouter = require(__dirname + "/routes/users");
const invoiceRouter = require(__dirname + "/routes/invoice");
const accountRouter = require(__dirname + "/routes/accounts");

app.use("/api", customerRouter);
app.use("/api", userRouter);
app.use("/api", invoiceRouter);
app.use("/api", accountRouter);

// app.get("/", (req, res) => {
// 	res.sendFile(path.join(__dirname, "../renderers/index.html"));
// });

process.on("SIGTERM", () => {
	app.close(() => {
		console.log("Server Closed");
	});
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(` Server is running on port ${port}`));
module.exports = app;
