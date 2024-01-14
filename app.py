from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import config

app = Flask(__name__)
CORS(app, origins="*", methods=['GET', 'POST', 'OPTIONS'])


@app.route('/api/upload/<project_id>', methods=['POST'])
def upload_file(project_id):
    if project_id == '':
        raise Exception("Error: Empty pid")
    files = request.files.getlist('file')
    for file in files:
        print(file.filename)
        if file.filename == '':
            raise Exception("Error: Empty file")
        if not file.filename.endswith('.pdf'):
            raise Exception("Error: Invalid file type")
        save_dir = './data/'+project_id
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        file.save(os.path.join(save_dir, file.filename))
        filepath = os.path.join(save_dir, file.filename)
        app.logger.info("File uploaded successfully")

    response = {
        'content':  'PDF uploaded successfully'
    }
    return response
        

if __name__ == '__main__':
    app.secret_key = config.SECRET_KEY
    app.run(debug=True)

