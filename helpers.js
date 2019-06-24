const fs = require('fs');

function getMtime(path) {
    return fs.statSync(path).mtime.getTime();
}

function error(message) {
    console.log(`ERROR: ${message}`);
    return;
}

module.exports = {
    getMtime,
    error
}