# thingiverse-to-slant3d
Download Thingiverse STL, upload to google cloud storage, and retrieve quote from Slant3D

![image](https://github.com/user-attachments/assets/2a36eeab-0a53-48cd-984a-538602ff69da)


Uses [thingiscrape library](https://github.com/cam-cambridge/thingiscrape)

## to run locally
```
cd ./server/
python3 - m pip install -r requirements.txt
```

## create a public google storage bucket (read and write)
Add your api keys to Slant3D and Thingiverse to .env

Copy the .env.example file to a new file named .env.
Replace the placeholder values in the .env file with your actual API keys, credentials, and bucket name.
Make sure to keep your .env file secure and do not commit it to version control.

Enter your storage bucket name  

## to run locally
```
python3 -m flask --app main run 
```
Copy a thingiverse url   
Retrieve Quote  

## to deploy to Google Cloud Run and Cloud Build
update cloudbuild.yaml and create a cloud run and cloud build app  
couldn't get working on cloudbuild- you are welcome to try

## Deploying to Vercel
Set the framework preset to "Other."  
Set the root directory to ./.  
Add your environment variables in Vercel, including the base64 encoded Google Application Credentials.

## sample application running here
plan3dprint.com/get-quotes


