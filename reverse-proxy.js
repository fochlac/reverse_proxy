const request = require("request"),
    defaultUrl = "fochlac.com",
    db = require("./proxy-db");

module.exports = (req, res) => {
    const url = reqURLMap(req);

    if (!url) {
        return res.redirect('https://' + defaultUrl);
    }

    console.log("redirecting from " + req.host + req.url + " to " + url);

    req.headers.originalIP = req.connection.remoteAddress;
    req
      .pipe(
        request({
          url,
          maxRedirects: 10,
          followOriginalHttpMethod: true
        })
      )
      .on("error", err => {
        console.log(err);
        res.status(200).sendFile(__dirname + '/500.html');
      })
      .pipe(res);
}


const reqURLMap = req => {
    const proxy = db.get(req.hostname);

    if (proxy && proxy.redirect || !proxy) {
      return false;
    }

    const port =
      typeof proxy.port === "number"
        ? proxy.port
        : process.env[proxy.port];

    if (!port) {
      console.log('Unable to find correct port number.');
      return false;
    }

    const urlpart = proxy ? proxy.url : undefined;

    return "http://localhost:" + port + (urlpart ? urlpart : "") + req.url;
  };