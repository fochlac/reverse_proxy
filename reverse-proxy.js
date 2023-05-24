const request = require("request"),
    defaultUrl = "fochlac.com",
    db = require("./proxy-db"),
    httpProxy = require('http-proxy');



module.exports = (server) => {

    const proxy = new httpProxy.createProxyServer()

    server.on('upgrade', (req, socket, head) => {
        const target = reqURLMap({ hostname: req.headers.host, url: '' })

        if (!target) {
            console.log(`[${req.headers.upgrade}] No Matching Target: upgrade ${req.method}-request from ${req.headers.origin + req.url}.`);
            req.end()
        }
        console.log(`[${req.headers.upgrade}] upgrade ${req.method}-request from ${req.headers.origin + req.url} to ${target}.`);
        
        try {
            proxy.ws(req, socket, head, { target: target.replace('http', 'ws') })
        }
        catch (err) {
            req.end()
            console.log(`[${req.headers.upgrade}] Error contacting target for upgrade ${req.method}-request from ${req.headers.origin + req.url}: `, err);
        }
    })

    return (req, res) => {
        const url = reqURLMap(req);

        if (!url) {
            console.log("url not found, redirecting to default url")
            return res.redirect('https://' + defaultUrl);
        }

        console.log("redirecting from " + req.protocol + "://" + req.host + req.url + " to " + url);

        req.headers.proxy_ip = req.connection.remoteAddress;
        req.headers.proxy_host = req.host;
        req.headers.proxy_url = req.url;
        req.headers.proxy_protocol = req.protocol;
        req.headers.proxied = true;
        
        req.pipe(
            request({
                url,
                maxRedirects: 10,
                followOriginalHttpMethod: true
            })
        )
            .on("error", err => {
                console.log(`error redirecting to "${url}", showing error page:`, err);
                res.status(200).sendFile(__dirname + '/500.html');
            })
            .pipe(res);
    }
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
