#!/usr/bin/env node

const express = require("express"),
  internalServer = express(),
  app = express(),
  http = require("http"),
  greenlock = require('./greenlock'),
  internalApi = require('./internal-api'),
  proxy = require("./reverse-proxy"),
  redirectHttps = require('redirect-https');


console.log(`running on node ${process.version}`)

greenlock.ready((glx) => {
  const httpsServer = glx.httpsServer(null, app)
  httpsServer.listen(443, () => {
    console.log('listening on port 443')
  })
  app.use(proxy(httpsServer))

  const httpServer = glx.httpServer(null, redirectHttps());

  httpServer.listen(80, "0.0.0.0", () => {
      console.log("Listening on ", httpServer.address());
  });

})

http.createServer(internalServer).listen(process.env.PROXY_PORT, 'localhost', () => {
  console.log('Internal proxy control up, listening on port: ', process.env.PROXY_PORT)
})

internalServer.use(internalApi)