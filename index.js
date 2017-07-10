#!/usr/bin/env node

const   https = require('https')
    ,   http = require('http')
    ,   proxy = require('http-proxy')
    ,   fs = require('fs')
    ,   server_port = 80
    ,   server_port_ssl = 443
    ,   server = proxy.createServer(
            {
                ssl: {
                    key: fs.readFileSync(process.env.KEYSTORE + 'fochlac_com_key.pem'),
                    cert: fs.readFileSync(process.env.KEYSTORE + 'fochlac_com_cert_chain.pem')
                },
                secure: true
            },
            (e) => {console.log(e)}
        )
    ,   defaultUrl = 'fochlac.com';

let     urlMap = require(process.env.PROXY_HOME + 'urlmap.js')
    ,   urlList = Object.keys(urlMap);


const handleServerError = (err, req, res) => {
        if (err.code === 'ECONNREFUSED' && err.port === 55432) {
            console.log('Error: Crawler is down!');
            res.writeHead(502);
            res.end();
        } else {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Something went wrong.');

            console.log(err);
        }
    },

    handleHttpsRequest = (req, res) => {
        let hostData = urlMap[req.headers.host];

        if (hostData) {
            if (hostData.redirect) {
                res.writeHead(302, {'Location': 'https://' + hostData.redirectUrl + req.url});
                res.end();
            } else {
                server.web(req, res, {target: (hostData.http ? 'http' : 'https') + '://localhost:' + ((typeof hostData.port === 'string') ? process.env[hostData.port] : hostData.port) + hostData.url}, (err) => {
                    if (err) console.log(err);
                });
            }
        } else {
            res.writeHead(302, {'Location': 'https://' + defaultUrl});
            res.end();
        }
    },

    handleHttpRequest = (req, res) => {
        res.writeHead(302, {
            'Location': 'https://' + ((urlMap[req.headers.host] && urlMap[req.headers.host].redirect) ? urlMap[req.headers.host].redirectUrl : req.headers.host) + req.url
        });
        res.end();
    };

server.on('error', handleServerError);

fs.watchFile(process.env.PROXY_HOME + 'urlmap.js', () => {
    delete require.cache[process.env.PROXY_HOME + 'urlmap.js'];
    urlMap = require(process.env.PROXY_HOME + 'urlmap.js');
    urlList = Object.keys(urlMap);
    console.log('refreshed urlmap');
});

https.createServer({
      key: fs.readFileSync(process.env.KEYSTORE + 'fochlac_com_key.pem'),
      cert: fs.readFileSync(process.env.KEYSTORE + 'fochlac_com_cert_chain.pem')
    }, handleHttpsRequest).listen(server_port_ssl);

http.createServer(handleHttpRequest).listen(server_port);