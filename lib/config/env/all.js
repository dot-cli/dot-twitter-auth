"use strict";

var path = require("path");

var rootPath = path.normalize(__dirname + "/../../..");

module.exports = {
  root: rootPath,
  port: process.env.PORT || 3000,
  cors: {
    allowedDomains: "*",
  },
  consumerKey: process.env.TWITTER_API_KEY,
  consumerSecret: process.env.TWITTER_API_SECRET,
};
