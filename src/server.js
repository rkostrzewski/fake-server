const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const console = require('better-console');
const Service = require('./service');

function Server(config) {
  var app = express();
  this._app = app;
  this._config = config;

  app.use(bodyParser.json());
  (config.services || [])
    .forEach(serviceConfig => {
      new Service(serviceConfig).register(app);
    });
}

Server.prototype.startHttp = function () {
  let port = this._config.http.port;
  var httpServer = http.createServer(this._app);
  httpServer.listen(port);
  console.info('Started https server on port ' + port + '!');
}

Server.prototype.startHttps = function () {
  const privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
  const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
  const credentials = {
    key: privateKey,
    cert: certificate
  };

  let port = this._config.https.port;
  let httpsServer = https.createServer(credentials, this._app);

  httpsServer.listen(port);
  console.info('Started https server on port ' + port + '!');
}

module.exports = Server;