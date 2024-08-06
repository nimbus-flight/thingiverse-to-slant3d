from flask import Flask, request, jsonify
import thingiscrape
import requests
import os
from flask import render_template  # Import render_template
from google.cloud import storage
from google.oauth2 import service_account
from google.cloud import storage
from dotenv import load_dotenv
from google.oauth2 import service_account
from google.cloud import storage


storage_client = storage.Client(credentials=credentials)
credentials = service_account.Credentials.from_service_account_file(
    os.environ['GOOGLE_APPLICATION_CREDENTIALS']
)


SLANT3D_API_KEY = os.getenv("SLANT3D_API_KEY")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
THINGIVERSE_TOKEN = os.getenv("THINGIVERSE_TOKEN")
THINGIVERSE_CLIENT_ID = os.getenv("THINGIVERSE_CLIENT_ID")
THINGIVERSE_CLIENT_SECRET = os.getenv("THINGIVERSE_CLIENT_SECRET")
SLANT_API_KEY = os.getenv("SLANT_API_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")


app = Flask(__name__, static_folder='.', static_url_path='') 

def get_stl_file_urls(thing_id):
    thing = thingiscrape.Thing(thing_id, api_token=THINGIVERSE_TOKEN)
    return [file.url for file in thing.files if file.type == "stl"]

def upload_to_gcs(file_url):
    # Download the STL file
    response = requests.get(file_url)
    response.raise_for_status()
    
    # Generate a unique filename (you can customize this)
    filename = f"stl_{thing_id}_{file_url.split('/')[-1]}"
    
    # Upload to Google Cloud Storage
    blob = bucket.blob(filename)
    blob.upload_from_string(response.content, content_type="model/stl")

    return blob.public_url  # Return the public URL of the uploaded file



def get_slant3d_quote(file_url):
    headers = {
        "api-key": SLANT3D_API_KEY,
        "Content-Type": "application/json",
    }
    response = requests.post(
        "https://www.slant3dapi.com/api/slicer",
        json={"fileURL": file_url}, 
        headers=headers,
    )
    response.raise_for_status()  # Raise an exception for HTTP errors
    return response.json()  

@app.route('/get_quotes', methods=['POST'])
def get_quotes():
    # Google Cloud Storage setup (replace with your actual values)
    data = request.get_json()
    thing_id = data['thingiverseUrl'].split(":")[1] # Extract the thing ID
    BUCKET_NAME = 'your-stl-bucket'  
    BUCKET_NAME = data.get('storageBucket', BUCKET_NAME)  # Use default if not provided
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)


    # Modify the main function to accept thing_id as a parameter
    def main(thing_id):  
        stl_file_urls = get_stl_file_urls(thing_id)
        quotes = []
        for file_url in stl_file_urls:
            gcs_url = upload_to_gcs(file_url)  
            quote_data = get_slant3d_quote(gcs_url)
            delete_from_gcs(gcs_url)  # Delete after getting quote
            quotes.append(quote_data)
        return quotes

    quotes = main(thing_id, BUCKET_NAME)  # Call the modified main function
    return jsonify(quotes)

@app.route('/')
def index():
    return render_template('index.html')  # Render the index.html file

if __name__ == "__main__":
    app.run(debug=True)