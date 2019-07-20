// Init env values
require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const {execSync} = require('child_process');
const hlp = require('./helpers.js');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;
const JPG = require('jpeg-js');

const {IMAGE_DIR, API_USER, API_PASS} = process.env;

function watch() {
    console.log('taking image...');
    let filename = Date.now().toString();

	const oldImageExists = fs.existsSync(`${IMAGE_DIR}/old.jpg`);
	
	if(!oldImageExists) {
		console.log('comparator image does not exists...\ncreating and restarting...');
		filename = 'old';
	}

	let cmd = `raspistill -o ${IMAGE_DIR}/${filename}.jpg -n --timeout 1`;

    execSync(cmd);

	if(!oldImageExists) {
		watch();
		return;
	}

    fs.readdir(IMAGE_DIR, (err, data) => {
        if(err) return hlp.error(err);
        if(data.length < 1) {
            console.log('no images found');
	    watch();
            //setTimeout(watch,1000);
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
            if(data.length > 0) console.log('no images found');
            else console.log('image was not found');
			watch();
            //setTimeout(watch,1000);
            return;
        }

        // Returns file as a buffer
	console.log('comparing images');
        const file = fs.readFileSync(`${IMAGE_DIR}/${newest}`);

	let currJpg = JPG.decode(file);
	let oldJpg = JPG.decode(fs.readFileSync(`${IMAGE_DIR}/old.jpg`));
	
	let pxDiff = pixelmatch(
		currJpg.data,
		oldJpg.data,
		null,
		currJpg.width,
		currJpg.height,
		{threshold: 0.3}
	);

	fs.writeFileSync(`${IMAGE_DIR}/old.jpg`, file);
        fs.unlinkSync(`${IMAGE_DIR}/${newest}`);

        const API_LOCAL_URL = 'http://localhost:3000/watcher/api-upload'
        const API_LIVE_URL = 'https://nickneuman.co/watcher/api-upload'

	if(pxDiff) {
	    console.log('no notable changes, skipping upload');
	    watch();
	    return;
	}

	console.log('attempting upload...');
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
                console.log('upload attempt was successful');
		watch();
            })
            .catch(err => {
	        console.log('server encountered an error');
		watch();
	    });

        //setTimeout(watch,1000);
    });
}

watch();
