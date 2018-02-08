const   routes      = require('express').Router()
    ,   bodyparser  = require('body-parser')
    ,   db          = require("./proxy-db");

routes.use(bodyparser.json());

routes.post('/proxies', (req, res) => {
    db.set(req.body.host, req.body.proxy);

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

module.exports = routes;