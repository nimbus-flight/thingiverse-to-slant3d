# thingiverse-to-slant3d
Download Thingiverse STL, upload to google cloud storage, and retrieve quote from Slant3D

## to run locally
```
cd ./server/
pip install flask
pip install requirements.txt
```

```
python -m flask --app main run 
```
## create a public google storage bucket (read and write)
Enter your api keys to Slant3D and Thingiverse on localhost  
Enter your storage bucket url  
Copy a thingiverse url   
Retrieve Quote  

## to deploy to Google Cloud Run and Cloud Build
update cloudbuild.yaml and create a cloud run and cloud build app

## sample application running here
plan3dprint.com/get-quotes


