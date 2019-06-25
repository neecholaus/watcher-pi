// Init env values
require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const {exec} = require('child_process');
const hlp = require('./helpers.js');

const {IMAGE_DIR, API_USER, API_PASS} = process.env;

function watch() {
    console.log('Taking image...');
    const filename = Date.now().toString();
    let cmd = `raspistill -o ${IMAGE_DIR}/${filename}.jpg`;
    exec(cmd);

    fs.readdir(IMAGE_DIR, (err, data) => {
        if(err) return hlp.error(err);
        if(data.length < 1) {
            console.log('No images found.');
            setTimeout(watch,1000);
            return;
        }

        // Get newest first
        const newest = data.filter(file => {
            return ['png','jpg'].indexOf(file.split('.')[file.split('.').length-1]) >= 0;
        }).sort((a,b) => {
            return hlp.getMtime(`${IMAGE_DIR}/${b}`) - hlp.getMtime(`${IMAGE_DIR}/${a}`);
        })[0];

        // Make sure there is still an image after stripping non png/jpg files
        if(!fs.existsSync(`${IMAGE_DIR}/${newest}`)) {
            if(data.length > 0) console.log('No images found.');
            else console.log('Image was not found.');
            setTimeout(watch,1000);
            return;
        }

        // Returns file as a buffer
        const file = fs.readFileSync(`${IMAGE_DIR}/${newest}`);
        fs.unlinkSync(`${IMAGE_DIR}/${newest}`);

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
            .then(res => {
                console.log('Image has been uploaded.');
            })
            .catch(err => console.log('Server Error'));

        setTimeout(watch,1000);
    });
}

watch();