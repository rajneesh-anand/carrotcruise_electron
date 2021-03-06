const router = require("express").Router();
const AWS = require("aws-sdk");

router.get("/message", (req, res) => {
  var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log(fullUrl);

  AWS.config.update({ region: "ap-south-1" });

  var params = {
    Message: req.query.message,
    PhoneNumber: "+" + req.query.number,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: req.query.subject,
      },
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Transactional",
      },
    },
  };

  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params)
    .promise();

  publishTextPromise
    .then(function (data) {
      res.send({
        MessageID: data.MessageId,
        message: "Success : Message Sent ",
      });
    })
    .catch(function (err) {
      res.send({ Error: err });
    });
});

module.exports = router;
