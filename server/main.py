from flask import Flask, request, jsonify
import thingiscrape
import requests
import os
from flask import render_template  # Import render_template

THINGIVERSE_TOKEN = os.environ.get('THINGIVERSE_TOKEN')
SLANT3D_API_KEY = os.environ.get('SLANT3D_API_KEY')

app = Flask(__name__, static_folder='.', static_url_path='') 

def get_stl_file_urls(thing_id):
    thing = thingiscrape.Thing(thing_id, api_token=THINGIVERSE_TOKEN)
    return [file.url for file in thing.files if file.type == "stl"]



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
    thing_id = data['thingiverseUrl'].split(":")[1] # Extract the thing ID

    # Modify the main function to accept thing_id as a parameter
    def main(thing_id):  
        stl_file_urls = get_stl_file_urls(thing_id)
        quotes = []
        for file_url in stl_file_urls:
            quote_data = get_slant3d_quote(file_url)
            quotes.append(quote_data)
        return quotes

    quotes = main(thing_id)  # Call the modified main function
    return jsonify(quotes)

@app.route('/')
def index():
    return render_template('index.html')  # Render the index.html file

if __name__ == "__main__":
    app.run(debug=True)