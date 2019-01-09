#!/usr/bin/env node

const express = require("express"),
  internalServer = express(),
  app = express(),
  http = require("http"),
  greenlock = require('./greenlock'),
  internalApi = require('./internal-api'),
  https = require('https'),
  proxy = require("./reverse-proxy"),
  redirectHttps = require('redirect-https');

app.use(proxy);

https.createServer(greenlock.httpsOptions, greenlock.middleware(app)).listen(443)
http.createServer(greenlock.middleware(redirectHttps())).listen(80);

http.createServer(internalServer).listen(process.env.PROXY_PORT, 'localhost', () => {
  console.log('Internal proxy control up, listening on port: ', process.env.PROXY_PORT)
})

internalServer.use(internalApi)