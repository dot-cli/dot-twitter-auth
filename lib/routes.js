"use strict";

var TwitterPin = require("./auth");
var TwitterAPI = require("twitter-api-sdk");
var TwitterApiV2 = require("twitter-api-v2");

// token pin cache with 5 minute expiry
const TTLCache = require("@isaacs/ttlcache");
const tokenPins = new TTLCache({ max: 10000, ttl: 300000 });

module.exports = function (app, config) {
  var twitterPin = TwitterPin(config.consumerKey, config.consumerSecret);

  const authClient = new TwitterAPI.auth.OAuth2User({
    client_id: config.consumerV2Key,
    client_secret: config.consumerV2Secret,
    callback:
      config.twitterCallbackUrl || "http://localhost:3000/twitter/callback",
    scopes: [
      "tweet.read",
      "users.read",
      "follows.read",
      "follows.write",
      "list.read",
      "list.write",
      "offline.access",
    ],
  });

  const clientV2 = new TwitterApiV2.TwitterApi({
    clientId: config.consumerV2Key,
    clientSecret: config.consumerV2Secret,
  });

  const STATE = "dot-twitter-auth-state";

  // For reference only
  app.get("/twitter/v1/auth", (req, res) => {
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

  app.get("/twitter/auth", (req, res) => {
    const authUrl = authClient.generateAuthURL({
      state: STATE,
      code_challenge_method: "s256",
    });
    res.redirect(authUrl);
  });

  app.get("/twitter/callback", async function (req, res) {
    try {
      const { code, state } = req.query;
      if (state !== STATE) return res.status(500).send("State isn't matching");
      const token = await authClient.requestAccessToken(code);
      const pin = "" + Math.floor(Math.random() * 9999999);
      tokenPins.set(pin, token);
      const response = `<div style="-webkit-text-size-adjust: 100%;padding: 0;direction: ltr;font-family: ;width: 100%; helvetica neue,helvetica,arial,sans-serif; background:=#fff; color:#292f33; font-size:14px; line-height:18px; overflow-y:scroll; margin: auto; padding-top: 20px; text-align: center;"> <div id="bd" role="main" style="-webkit-text-size-adjust: 100%; direction: ltr; font-family:helvetica neue, helvetica,arial, sans-serif; color:#292f33; font-size:14px; line-height:18px; min-width:240px; max-width:640px; width:auto; margin:0 auto; padding:20px 20px; border:1px solid #ccd6dd; border-radius:4px; margin-bottom:20px;"> <p style="-webkit-text-size-adjust: 100%; direction: ltr; font-family: helvetica neue,helvetica,arial,sans-serif; font-size: 14px; line-height: 18px; padding: 0; margin: color: #66757f; font-weight: 300;">You've granted access to <b>dot-follow</b>!</p><div id="oauth_pin" style="-webkit-text-size-adjust: 100%; direction: ltr; font-family: helvetica neue,helvetica,arial,sans-serif; color: #292f33; font-size: 14px; line-height: 18px;"><p style="-webkit-text-size-adjust: 100%; direction: ltr; font-family: helvetica neue,helvetica,arial,sans-serif; font-size: 14px; line-height: 18px; background-color: #f5f8fa; color: #8899a6; padding: 15px 15px; margin: 10px 0; user-select: none; cursor: default; border-radius: 4px;"><span id="code-desc" style="-webkit-text-size-adjust: 100%; direction: ltr; font-family: helvetica neue,helvetica,arial,sans-serif; font-size: 14px; line-height: 18px; color: #8899a6; user-select: none; cursor: default;">Next, return to dot-follow and enter this PIN to complete the authorization process:</span><kbd aria-labelledby="code-desc" style="-webkit-text-size-adjust: 100%; direction: ltr; line-height: 18px; color: #8899a6; user-select: none; cursor: default; font-family: monospace,monospace; font-size: 1em;"><code style="-webkit-text-size-adjust: 100%; direction: ltr; font-family: monospace,monospace; display: block; margin: 10px 0 0; text-align: center; font-size: 72px; line-height: 72px; font-weight: bold; color: #292f33; user-select: text; cursor: text;">${pin}</code></kbd></p> </div> </div> </div>`;
      return res.send(response);
    } catch (e) {
      console.error(e);
      return res.send("Something went wrong");
    }
  });

  app.get("/twitter/token", function (req, res) {
    if (req.query && req.query.pin) {
      const token = tokenPins.get(req.query.pin);
      if (token) {
        return res.send(token);
      } else {
        return res.status(404).send({ message: "Not found" });
      }
    }
    return res.status(400).send({ message: "Bad request" });
  });

  app.get("/twitter/refreshToken", async (req, res) => {
    if (req.query && req.query.refreshToken) {
      try {
        const token = await clientV2.refreshOAuth2Token(req.query.refreshToken);
        if (token) {
          const now = new Date().getTime();
          const expiresAt = new Date(
            now + token.expiresIn * 1000
          ).toISOString();
          return res.send({
            token: {
              token_type: "bearer",
              access_token: token.accessToken,
              scope: token.scope.join(" "),
              refresh_token: token.refreshToken,
              expires_at: expiresAt,
            },
          });
        } else {
          return res.status(400).send({ message: "Bad request" });
        }
      } catch (e) {
        return res.status(400).send({ message: "Bad request", ...e.data });
      }
    }
    return res.status(400).send({ message: "Bad request" });
  });
};
