'use strict';

var express = require('express.io');
const enforceSSL = require('express-sslify')

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

function isHeroku() {
  return process.env._ && process.env._.indexOf('heroku') !== -1
}

var config = require('./lib/config/config');
var app = express();

// Force SSL on heroku only
if (isHeroku()) {
  app.use(
    enforceSSL.HTTPS({
      /* Heroku specific option */
      trustProtoHeader: true
    })
  )
}

app.http().io();

require('./lib/config/express')(app);
require('./lib/routes')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

exports = module.exports = app;
