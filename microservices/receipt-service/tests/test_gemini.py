import os
from dotenv import load_dotenv
load_dotenv()


def test_receipt_images(app_client, receipt_images, receipt_image_ans, subtests):
    for image_name, file_to_test in receipt_images.items():
        with subtests.test(msg=f"Evaluating image: {image_name}"):
            data = {
                'file': (file_to_test.stream, file_to_test.filename, file_to_test.content_type),
                'model': 'GEMINI',
                'apiKey': os.getenv('GOOGLE_API_KEY')
            }

            response = app_client.post(
                '/upload',
                data=data
            )

            assert response.status_code == 200

            for field, expected_value in receipt_image_ans[image_name].items():
                actual_value = response.json.get(field)
                assert expected_value.lower().strip() == actual_value.lower().strip(), f"Mismatch in field '{field}' for image '{image_name}'"


def test_non_receipt_images(app_client, non_receipt_images, subtests):
    for image_name, file_to_test in non_receipt_images.items():
        with subtests.test(msg=f"Evaluating image: {image_name}"):
            data = {
                'file': (file_to_test.stream, file_to_test.filename, file_to_test.content_type),
                'model': 'GEMINI',
                'apiKey': os.getenv('GOOGLE_API_KEY')
            }

            response = app_client.post(
                '/upload',
                data=data
            )

            assert response.status_code == 400
            assert response.json.get('error') == "Image is not a receipt or error parsing receipt"