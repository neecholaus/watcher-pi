const fs = require('fs');

const Helpers = {
    getMtime: (path) => {
        return fs.statSync(path).mtime.getTime();
    },
    error: (message) => {
        console.log(`ERROR: ${message}`);
        return;
    }
}

module.exports = Helpers;