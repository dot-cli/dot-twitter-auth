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
  consumerV2Key: process.env.TWITTER_API_V2_KEY,
  consumerV2Secret: process.env.TWITTER_API_V2_SECRET,
  twitterCallbackUrl: process.env.TWITTER_CALLBACK_URL,
};
