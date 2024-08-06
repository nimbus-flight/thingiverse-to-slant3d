## thingiverse-to-slant3d
Download Thingiverse STL, upload to google cloud storage, and retrieve quote from Slant3D

# to run locally
```
cd ./server/
pip install flask
pip install requirements.txt
```

```
python -m flask --app main run 
```

Pass your api keys - Slant3D and Thingiverse in on localhost

# to deploy to Google Cloud Run and Cloud Build
update cloudbuild.yaml and create a cloud run and cloud build app


