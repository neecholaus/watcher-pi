// Init env values
require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
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
    if(err) return hlp.error(err);
    if(data.length < 1) return hlp.error('No images found.');

    // Get newest first
    const newest = data.filter(file => {
        return ['png','jpg'].indexOf(file.split('.')[file.split('.').length-1]) >= 0;
    }).sort((a,b) => {
        return hlp.getMtime(`${IMAGE_DIR}/${b}`) - hlp.getMtime(`${IMAGE_DIR}/${a}`);
    })[0];

    // Returns file as a buffer
    const file = fs.readFileSync(`${IMAGE_DIR}/${newest}`);

    const API_LOCAL_URL = 'http://localhost:3000/watcher/api-upload'
	const API_LIVE_URL = 'https://nickneuman.co/watcher/api-upload'

    axios({
        url: API_LIVE_URL,
        method: 'POST',
        data: {file},
        auth: {
            username: API_USER,
            password: API_PASS
        }
    })
        .then(res => console.log(res))
        .catch(err => console.log('Error: ' + err));
});