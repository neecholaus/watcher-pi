// Init env values
require('dotenv').config();

const fs = require('fs');
const {exec} = require('child_process');
const hlp = require('./helpers.js');

const {
    IMAGE_DIR,
    API_USER,
    API_PASS
} = process.env;


console.log('Taking image...');
const cmd = `raspistill -o ${IMAGE_DIR}/image.jpg`;
// exec(cmd);

fs.readdir(IMAGE_DIR, (err, data) => {
    if(err) hlp.error(err);
    if(data.length < 1) hlp.error('No images found.');

    // Get newest first
    let sorted = data.sort((a,b) => {
        return hlp.getMtime(`${IMAGE_DIR}/${b}`) - hlp.getMtime(`${IMAGE_DIR}/${a}`);
    });
});