const { execSync } = require('child_process');

const   routes      = require('express').Router()
    ,   bodyparser  = require('body-parser')
    ,   db          = require("./proxy-db");

routes.use(bodyparser.json());

routes.use((req,res,next) => {
    console.log(req.url)
    next();
})

routes.post('/proxies', (req, res) => {
    if (!/[\w\d]+\.fochlac.com/.test(req.body.host)) {
        return res.status(400).send()
    }
    db.set(req.body.host, req.body.proxy);
    const output = execSync(`npx greenlock add --subject ${req.body.host} --altnames ${req.body.host}`, {cwd: '/home/reverse_proxy', encoding: 'utf8'})
    console.log(output)
    res.status(200).send();
})

routes.put('/proxies', (req, res) => {
    db.set(req.body.host, req.body.proxy);
    res.status(200).send();
})

routes.delete('/proxies', (req, res) => {
    db.delete(req.body.host);
    res.status(200).send();
})

routes.get('/proxies', (req, res) => {
    res.status(200).send(db.getAll());
})

routes.get('*', (req, res) => {
    res.status(404).json({status: 404, reason: 'unknown route'})
})
module.exports = routes;