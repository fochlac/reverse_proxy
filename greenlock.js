const glx = require('greenlock-express');
const db = require("./proxy-db");

const greenlock = glx.create({
    server: 'https://acme-v02.api.letsencrypt.org/directory',
    version: 'draft-11',
    configDir: './le-config',
    approveDomains,
    communityMember: false,
})

function approveDomains(options, certs, cb) {
    const domains = Object.keys(db.getAll())
    if (certs) {
        options.domains = [certs.subject].concat(certs.altnames);
    }

    if (options.domains.every(domain => domains.includes(domain))) {
        options.agreeTos = true;
        options.email = process.env.PROXY_MAIL;
        cb(null, { options, certs })
    } 
    else {
        cb(new Error('Unknown Domain.'));
    }
}

module.exports = greenlock