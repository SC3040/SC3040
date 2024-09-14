from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from gemini import GeminiReceiptParser
from Receipt import ReceiptEncoder

app = Flask(__name__)
app.json_encoder = ReceiptEncoder
CORS(app, resources={r"/*": {"origins": "*"}})

VALID_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in VALID_IMAGE_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    print("Inside /upload")
    if 'file' not in request.files:
        return jsonify({'error': 'No file received'}), 400

    # Unpack
    file = request.files['file']
    model = request.form.get('model')
    api_key = request.form.get('apiKey')

    # Check if everything is received
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(filename)

        # Initialize the receipt parser based on the model
        if model == 'GEMINI':
            # receipt_parser = ReceiptParser(os.environ['GOOGLE_API_KEY'])
            receipt_parser = GeminiReceiptParser(api_key)
        elif model == 'OPENAI':
            pass
        else:
            return jsonify({'error': 'Unsupported model parameter received'}), 400

        # Parse the receipt
        response = receipt_parser.parse(file)

        if response is None:
            return jsonify({'error': 'Image is not a receipt or error parsing receipt'}), 400

        return jsonify(response), 200
    
    return jsonify({'error': 'Invalid file type received'}), 400

if __name__ == '__main__':

    app.run(host='0.0.0.0', port=8081)