from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import config
from utils import parse_pdf, text_to_docs, embed_docs, search_docs, get_answer
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from openai import OpenAIError

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
        'content':  'PDF uploaded successfully',
        'path': filepath,
    }
    return response

@app.route('/api/extract/<project_id>', methods=['POST'])
def extract_content(project_id):
    with app.app_context():
        global index, doc
        data = request.get_json()
        filepath = data['filepath']
        app.logger.info("Extracting content from: " + filepath)
        
        doc = parse_pdf(filepath)
        text = text_to_docs(doc)
        print(text)
        index = embed_docs(text)
        index.save_local('./data/'+project_id+'/index/'+os.path.splitext(os.path.basename(filepath))[0])
        print(index)
        os.remove(filepath)

        response = {
            'content': 'PDF extracted successfully'
        }
        return response

@app.route('/api/<projectID>/query', methods=['POST'])
def handle_query(projectID):
    data = request.get_json()
    pid, query = projectID, data['prompt']
    if pid == '':
        raise Exception('Error: Empty pid')
    if not os.path.exists('./data/'+pid+'/index'):
        raise Exception('Error: Index not found')
    # Handle context passing into get_answer func
    embeddings = OpenAIEmbeddings(openai_api_key=os.environ['OPENAI_API_KEY'])
    for idx in os.listdir('./data/'+pid+'/index'):
        index = FAISS.load_local('./data/'+pid+'/index/'+idx, embeddings)
        sources = search_docs(index, query)
        try:
            answer = get_answer(sources, data)
            app.logger.info("Sources", sources)
            app.logger.info("Answers", answer)
        except OpenAIError as e:
            app.logger.error(e._message)

    response = {
        'content': answer["output_text"].split("SOURCES: ")[0],
    }

    return response

if __name__ == '__main__':
    app.secret_key = config.SECRET_KEY
    app.run(debug=True)

