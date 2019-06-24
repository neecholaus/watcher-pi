#!/usr/bin/python
import os
import requests
import datetime
import glob
import env
import time

while True:
	print("Taking Image...")
	imgname = "image.jpg"
	cmd = "raspistill -o %s%s" % (env.IMAGE_SAVE_TO, imgname)
	os.system(cmd)

	print("Fetching image...")

	API_LOCAL_URL = 'http://localhost:3000/watcher/api-upload'
	API_LIVE_URL = 'https://nickneuman.co/watcher/api-upload'

	# Get most recent image
	ImageDirPath = env.IMAGE_GET_FROM
	ImageDir = glob.glob(ImageDirPath)

	# Ensure max() has images to compare
	if len(ImageDir) > 0:
		MostRecentImage = max(ImageDir, key=os.path.getctime)
		ImagePath = MostRecentImage
	else:
		print("No images were found")
		exit()

	# Ensure image exists
	ImageExists = os.path.exists(ImagePath)
	if ImageExists:
		Image = open(ImagePath, 'rb')
	else:
		print("Image does not exist")
		exit()

	# Form multipart and payload
	Files = {'file': Image}
	TakenAt = (datetime.datetime.now()).ctime()
	Data = {'taken_at': TakenAt}

	# Auth Headers
	USER = env.USER
	PWD = env.PWD

	# Send data
	print("Uploading image")
	Response = requests.post(API_LIVE_URL, auth=(USER, PWD), files=Files, data=Data)

	Image.close()
	Status = Response.status_code
	if Status != 200:
		print("HTTP Status: %s" % Status)
		print("Image was not uploaded")
	else:
		os.remove(ImagePath)
		print("Local copy removed")
		print("Upload was successful")

	time.sleep(1)

exit()
