const fs = require('fs')
const proxyFile =  __dirname + '/proxies.json'
let proxies = {};

const file = fs.readFileSync(proxyFile, 'utf8');

try {
    proxies = JSON.parse(file);
} catch(err) {
    console.log('unable to load ', proxyFile);
}

const write = () => {
    fs.writeFile(proxyFile, JSON.stringify(proxies), 'utf8', (err) => {
        if (err) {
            console.log('error saving data' + err);
        }
        console.log('successfully saved data');
    });
}


module.exports = {
    get: (key) =>  proxies[key],
    set: (key, obj) => {
        proxies[key] = obj;
        write();
    },
    delete: (key) => {
        delete proxies[key];
        write();
    },

    getAll: () => proxies,
}

