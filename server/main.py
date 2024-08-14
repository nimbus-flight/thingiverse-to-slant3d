from flask import Flask, request, jsonify
import thingiscrape
import requests
import os
import json
from flask import render_template
from google.cloud import storage
from google.oauth2 import service_account
from dotenv import load_dotenv
from google.cloud import secretmanager


# Decode and write the service account key (useful for Vercel deployment)
if 'GOOGLE_APPLICATION_CREDENTIALS_BASE64' in os.environ:
    with open('service-account-key.json', 'w') as f:
        f.write(base64.b64decode(os.environ['GOOGLE_APPLICATION_CREDENTIALS_BASE64']).decode('utf-8'))
    credentials = service_account.Credentials.from_service_account_file('service-account-key.json')
else:
    if os.environ.get('GAE_ENV', '').startswith('standard'):  # Check if running on Cloud Run
        # Production: Load credentials from the environment variable set by Cloud Run secrets
        credentials = service_account.Credentials.from_service_account_info(
            json.loads(os.environ['GOOGLE_APPLICATION_CREDENTIALS'])
        )

        # Access other environment variables from the secret
        secret_client = secretmanager.SecretManagerServiceClient()
        secret_name = "projects/{}/secrets/{}/versions/latest".format(os.environ['PROJECT_ID'], 'thingiverse-slant3d-env')
        response = secret_client.access_secret_version(request={"name": secret_name})
        secret_payload = response.payload.data.decode("UTF-8")
        
        # Parse the secret payload and extract environment variables
        for line in secret_payload.splitlines():
            key, value = line.split('=', 1)
            os.environ[key] = value
    else:
        # Local development: Load .env file
        load_dotenv()
        try:
            credentials = service_account.Credentials.from_service_account_file(
                os.environ['GOOGLE_APPLICATION_CREDENTIALS']
            )
        except FileNotFoundError:
            # If the file is not found, try loading directly from the environment variable
            try:
                credentials = service_account.Credentials.from_service_account_info(
                    json.loads(os.environ['GOOGLE_APPLICATION_CREDENTIALS'])
                )
            except (KeyError, json.JSONDecodeError):
                print("Error: GOOGLE_APPLICATION_CREDENTIALS is not set or invalid.")
                # Handle the error appropriately (e.g., exit the program or skip GCS initialization)

storage_client = storage.Client(credentials=credentials)

SLANT3D_API_KEY = os.getenv("SLANT_API_KEY")
THINGIVERSE_TOKEN = os.getenv("THINGIVERSE_TOKEN")
THINGIVERSE_CLIENT_ID = os.getenv("THINGIVERSE_CLIENT_ID")
THINGIVERSE_CLIENT_SECRET = os.getenv("THINGIVERSE_CLIENT_SECRET")
BUCKET_NAME = os.getenv("BUCKET_NAME")

app = Flask(__name__, static_folder='.', static_url_path='') 

def get_stl_file_urls(thing_id):
    return thingiscrape.get_stl_urls(thing_id, THINGIVERSE_TOKEN)

def upload_to_gcs(file_url):
    response = requests.get(file_url)
    response.raise_for_status()

    filename = requests.utils.unquote(response.url.split("filename=")[-1]) 
    final_filename = filename.split('/')[-1]
    print(final_filename)
    blob = bucket.blob(final_filename)
    blob.upload_from_string(response.content, content_type="model/stl")
    
    print(blob.public_url)
    return blob.public_url  # Return the public URL of the uploaded file

def delete_from_gcs(gcs_file_url):
    blob_name = gcs_file_url.split("/")[-1]  
    blob = bucket.blob(blob_name)
    blob.delete()

def main(thing_id): 
    global bucket
    bucket = storage_client.bucket(BUCKET_NAME) 
    stl_file_urls = get_stl_file_urls(thing_id)
    quotes = []
    for file_url in stl_file_urls:
        gcs_url = upload_to_gcs(file_url)  
        print(gcs_url)
        quote_data = get_slant3d_quote(gcs_url)
        delete_from_gcs(gcs_url)  # Delete after getting quote
        quotes.append(quote_data)
    return quotes

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
    response.raise_for_status()
    return response.json()  

@app.route('/get_quotes', methods=['POST'])
def get_quotes():
    data = request.get_json()
    thing_id = data['thingiverseId']
    quotes = main(thing_id) 
    return jsonify(quotes)

@app.route('/get_thing_image', methods=['POST'])
def get_thing_image():
    data = request.get_json()
    thing_id = data['thingiverseId']
    
    print(f"Received request for Thingiverse ID: {thing_id}")
    
    image_url = thingiscrape.get_first_image_url(thing_id, THINGIVERSE_TOKEN)
    
    if image_url:
        print(f"Image URL retrieved: {image_url}")
    else:
        print("Failed to retrieve image URL, received null")
    
    return jsonify({'imageUrl': image_url})

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    from waitress import serve
    serve(app, host='0.0.0.0', port=8080)
