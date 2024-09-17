from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from gemini import GeminiReceiptParser
from Receipt import ReceiptEncoder
from gpt4o import OpenAIReceiptParser
from flask import Response
import json

def create_app():
    app = Flask(__name__)
    app.json_encoder = ReceiptEncoder
    CORS(app, resources={r"/*": {"origins": "*"}})

    VALID_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}

    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in VALID_IMAGE_EXTENSIONS

    @app.route('/upload', methods=['POST'])
    def upload_file():
        if 'file' not in request.files:
            return jsonify({'error': 'No file received'}), 400

        # Unpack
        file = request.files['file']
        model = request.form.get('model')
        api_key = request.form.get('apiKey')

        # Check if everything is received
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if not model:
            return jsonify({'error': 'Missing model parameter'}), 400

        if not api_key:
            return jsonify({'error': 'Missing apiKey parameter'}), 400

        # If file is present and correct type
        if file and allowed_file(file.filename):
            # filename = secure_filename(file.filename)
            # file.save(filename)

            # Initialize the receipt parser based on the model
            if model == 'GEMINI':
                # receipt_parser = ReceiptParser(os.environ['GOOGLE_API_KEY'])
                receipt_parser = GeminiReceiptParser(api_key)
            elif model == 'OPENAI':
                receipt_parser = OpenAIReceiptParser(api_key)
            else:
                return jsonify({'error': 'Unsupported model parameter received'}), 400

            # Parse the receipt
            response = receipt_parser.parse(file)

            if response is None:
                return jsonify({'error': 'Image is not a receipt or error parsing receipt'}), 400

            # Use ReceiptEncoder explicitly because some error with pytest not using
            response_json = json.dumps(response, cls=ReceiptEncoder)
            return Response(response_json, mimetype='application/json'), 200
            # return jsonify(response), 200

        return jsonify({'error': 'Invalid file type received'}), 400

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8081)