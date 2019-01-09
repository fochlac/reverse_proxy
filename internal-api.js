const   routes      = require('express').Router()
    ,   bodyparser  = require('body-parser')
    ,   db          = require("./proxy-db");

routes.use(bodyparser.json());

routes.use((req,res,next) => {
    console.log(req.url)
    next();
})

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

routes.get('*', (req, res) => {
    res.status(404).json({status: 404, reason: 'unknown route'})
})
module.exports = routes;