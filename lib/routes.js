"use strict";

var TwitterPin = require("./auth");

module.exports = function (app, config) {
  var twitterPin = TwitterPin(config.consumerKey, config.consumerSecret);

  app.get("/authorize", (req, res) => {
    if (req.query && req.query.token && req.query.pin) {
      twitterPin.authorize(
        req.query.token.trim(),
        req.query.pin.trim(),
        function (err, result) {
          if (err) {
            return res.status(500).send({
              message: "Error - " + err,
            });
          }

          return res.send(result);
        }
      );
    } else {
      twitterPin.getUrl(function (err, token, url) {
        if (err) {
          return res.status(500).send({
            message: "Error - " + err,
          });
        }

        return res.send({ ok: true, token, url });
      });
    }
  });
};
