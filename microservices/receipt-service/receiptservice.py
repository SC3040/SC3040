from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from gemini import ReceiptParser
# Create ins
receipt_parser = ReceiptParser(os.environ['GOOGLE_API_KEY'])

app = Flask(__name__)
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
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):

        filename = secure_filename(file.filename)
        file.save(filename)

        # Parse the receipt
        response = receipt_parser.parse(file)
        print(response)

        return jsonify({'message': 'File uploaded successfully'}), 200
    
    return jsonify({'error': 'Invalid file type received'}), 400

if __name__ == '__main__':

    app.run(host='0.0.0.0', port=8081)