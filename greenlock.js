var Greenlock = require("greenlock-express")
var greenlock = Greenlock.init({
    packageRoot: __dirname,
    configDir: './greenlock.d',
    maintainerEmail: process.env.PROXY_MAIL,
    cluster: false,
    notify: function(event, details) {
        if ('error' === event) {
            console.error(details);
        }
    }
});

module.exports = greenlock