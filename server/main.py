from flask import Flask, request, jsonify
import thingiscrape
import requests
import os
import json
from flask import render_template  # Import render_template
from google.cloud import storage
from google.cloud import storage
from google.oauth2 import service_account
from dotenv import load_dotenv
from google.cloud import secretmanager



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
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
THINGIVERSE_TOKEN = os.getenv("THINGIVERSE_TOKEN")
THINGIVERSE_CLIENT_ID = os.getenv("THINGIVERSE_CLIENT_ID")
THINGIVERSE_CLIENT_SECRET = os.getenv("THINGIVERSE_CLIENT_SECRET")
SLANT_API_KEY = os.getenv("SLANT_API_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

app = Flask(__name__, static_folder='.', static_url_path='') 

def get_stl_file_urls(thing_id):
    return thingiscrape.get_stl_urls(thing_id, THINGIVERSE_TOKEN)

def upload_to_gcs(file_url):
    # Download the STL file
    response = requests.get(file_url)
    response.raise_for_status()

    # Extract the filename from the query parameters
    filename = requests.utils.unquote(response.url.split("filename=")[-1]) 

    # Further process the filename to get only the last part (after the last '/')
    final_filename = filename.split('/')[-1]
    print(final_filename)
    # Upload to Google Cloud Storage
    blob = bucket.blob(final_filename)
    blob.upload_from_string(response.content, content_type="model/stl")
    
    print(blob.public_url)

    return blob.public_url  # Return the public URL of the uploaded file

def delete_from_gcs(gcs_file_url):
    blob_name = gcs_file_url.split("/")[-1]  
    blob = bucket.blob(blob_name)
    blob.delete()

# Modify the main function to accept thing_id as a parameter
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
    response.raise_for_status()  # Raise an exception for HTTP errors
    return response.json()  

@app.route('/get_quotes', methods=['POST'])
def get_quotes():
    data = request.get_json()
    thing_id = data['thingiverseId']
    quotes = main(thing_id) 
    return jsonify(quotes)

@app.route('/')
def index():
    return render_template('index.html')  # Render the index.html file

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=True)
