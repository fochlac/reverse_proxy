#!/usr/bin/env node

const express = require("express"),
  internalServer = express(),
  app = express(),
  http = require("http"),
  server_port = 80,
  server_port_ssl = 443,
  fs = require("fs"),
  proxy = require("./reverse-proxy"),
  internalAPI = require('./internal-api')
  server_ip_address = "fochlac.com",
  https = require("https"),
  sslServer = https.createServer(
    {
      key: fs.readFileSync(process.env.KEYSTORE + "fochlac_com_key.pem"),
      cert: fs.readFileSync(process.env.KEYSTORE + "fochlac_com_cert_chain.pem")
    },
    app
  );

sslServer.listen(server_port_ssl, server_ip_address, () => {
  console.log("listening on port " + server_port);
});

http.createServer((req, res) => {
    res.writeHead(302, {
      Location: "https://" + req.headers.host + req.url
    });
    res.end();
  })
  .listen(server_port);

http.createServer(internalServer).listen(process.env.PROXY_PORT, 'localhost', () => {
  console.log('Internal proxy control up, listening on port: ', process.env.PROXY_PORT)
})

internalServer.use(internalAPI)

app.use("/", proxy);
