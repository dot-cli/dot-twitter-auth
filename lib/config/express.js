'use strict';

var express = require('express.io'),
    path = require('path'),
    config = require('./config');

module.exports = function(app) {
  app.configure('development', function(){

    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static('public'));
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.use(express.errorHandler());
    app.set('views', config.root + '/app/views');
  });

  app.configure('production', function(){
    app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
  });

  app.configure(function(){
    app.engine('html', require('ejs').renderFile);
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());

    //CORS middleware for API layer
    var allowCrossDomain = function (req, res, next) {
      if (req.url.indexOf('/api/') !== -1) {
        res.header('Access-Control-Allow-Origin', config.cors.allowedDomains);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type,X-UserId');
      }
      next();
    };
    app.use(allowCrossDomain);

    app.use(app.router);
  });
};
