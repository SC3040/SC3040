import io


def test_missing_file_param(app_client):
    # Missing file
    response = app_client.post('/upload', data={
        'model': 'GEMINI', 'apiKey': 'test'})
    assert response.status_code == 400
    assert response.json == {'error': 'No file received'}

def test_missing_model_param(app_client):
    # Missing model
    response = app_client.post('/upload', data={
        'file': (io.BytesIO(b'test file content'), 'test_image.jpg'), 'apiKey': 'test'})

    assert response.status_code == 400
    assert response.json == {'error': 'Missing model parameter'}


def test_missing_api_key_param(app_client):
    # Missing apiKey
    response = app_client.post('/upload', data={
        'file': (io.BytesIO(b'test file content'), 'test_image.jpg'), 'model': 'GEMINI'})

    assert response.status_code == 400
    assert response.json == {'error': 'Missing apiKey parameter'}

    # Missing apiKey
    response = app_client.post('/upload', data={
        'file': (io.BytesIO(b'test file content'), 'test_image.jpg'), 'model': 'OPENAI'})

    assert response.status_code == 400
    assert response.json == {'error': 'Missing apiKey parameter'}