#!/usr/bin/env node

const express = require("express"),
  app = express(),
  server = require("http"),
  server_port = 80,
  server_port_ssl = 443,
  defaultUrl = "fochlac.com",
  fs = require("fs"),
  server_ip_address = "fochlac.com",
  https = require("https"),
  request = require("request"),
  sslServer = https.createServer(
    {
      key: fs.readFileSync(process.env.KEYSTORE + "fochlac_com_key.pem"),
      cert: fs.readFileSync(process.env.KEYSTORE + "fochlac_com_cert_chain.pem")
    },
    app
  );

let urlMap = require(process.env.PROXY_HOME + "urlmap.js"),
  urlList = Object.keys(urlMap);

sslServer.listen(server_port_ssl, server_ip_address, () => {
  console.log("listening on port " + server_port);
});

app.use("/", (req, res) => {
  if (redirect(req.headers.host) || !urlMap[req.headers.host]) {
    return res.redirect(urlMap[req.headers.host].redirect);
  }

  req.originalIP = req.connection.remoteAddress;
  req
    .pipe(
      request("http://localhost" + subdomainMap(req.headers.host) + req.url)
    )
    .on("error", err => {
      console.log(err);
      res.redirect("https://" + defaultUrl);
    })
    .pipe(res);
});

fs.watchFile(process.env.PROXY_HOME + "urlmap.js", () => {
  delete require.cache[process.env.PROXY_HOME + "urlmap.js"];
  urlMap = require(process.env.PROXY_HOME + "urlmap.js");
  urlList = Object.keys(urlMap);
  console.log("refreshed urlmap");
});

server
  .createServer((req, res) => {
    res.writeHead(302, {
      Location: "https://" + req.headers.host + req.url
    });
    res.end();
  })
  .listen(server_port);

const redirect = subdomain => {
  return urlMap[subdomain] && urlMap[subdomain].redirect;
};

const subdomainMap = subdomain => {
  const port =
    typeof urlMap[subdomain].port === "number"
      ? urlMap[subdomain].port
      : process.env[urlMap[subdomain].port];

  const urlpart = urlMap[subdomain] ? urlMap[subdomain].url : undefined;

  return ":" + port + (urlpart ? urlpart : "");
};
