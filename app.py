from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import config
from utils import parse_pdf, text_to_docs, embed_docs, search_docs, get_answer
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from openai import OpenAIError
from celery import Celery
from celery.result import AsyncResult

app = Flask(__name__)
CORS(app, origins="*", methods=['GET', 'POST', 'OPTIONS'])
broker_host = os.getenv('RABBITMQ_HOST', 'localhost')
app.config['CELERY_BROKER_URL'] = 'amqp://guest@localhost:5672//'
app.config['CELERY_RESULT_BACKEND'] = 'db+postgresql://app:app@localhost:5432/celery'
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'], backend=app.config['CELERY_RESULT_BACKEND'])
celery.conf.update(app.config)
celery.config_from_object('settings')



@app.route('/api/upload/<project_id>', methods=['POST'])
def upload_task(project_id):
    app.logger.info("Request files below")
    app.logger.info(request.files)
    pid = project_id
    files = request.files.getlist('file')
    if pid == '':
        return jsonify({"content": "Error: Empty pid"}), 400
    for file in files:
        if file.filename == '':
            return jsonify({"content": "Error: Empty file"}), 400

    result = upload_pdf(files, pid)
    return jsonify({"content": "File is being uploaded and extracted", 'tasks': result}), 202


@celery.task(name='app.upload_pdf', compression='zlib')
def upload_pdf(files, pid):
    tasks = []
    if pid == '':
        raise Exception('Error: Empty pid')
    for file in files:
        if file.filename == '':
            raise Exception('Error: Empty file')
        save_dir = './data/'+pid
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        if not file.filename.endswith('.pdf'):
            raise Exception('Error: Invalid file type')
        file.save(os.path.join(save_dir, file.filename))
        filepath = os.path.join(save_dir, file.filename)
        app.logger.info("File uploaded successfully")
        task = extract_content.delay({'filepath': filepath}, pid)
        tasks.append(task.id)
    return tasks

@celery.task(name='app.extract_content', compression='zlib')
def extract_content(data, pid):
    with app.app_context():
        global index, doc
        filepath = data['filepath']
        app.logger.info("Extracting content from file: " + filepath)
        doc = parse_pdf(filepath)
        text = text_to_docs(doc)
        index = embed_docs(text)
        index.save_local('./data/'+pid+'/index/'+os.path.splitext(os.path.basename(filepath))[0])
        response = {
            'content': 'PDF extracted successfully',
        }
        return response

@app.route('/api/<projectID>/query', methods=['POST'])
def query_task(projectID):
    data = request.get_json()
    tasks = []
    pid, query = projectID, data['prompt']
    if pid == '':
        raise Exception('Error: Empty pid')
    if not os.path.exists('./data/'+pid+'/index'):
        raise Exception('Error: Index not found')

    for idx in os.listdir('./data/'+pid+'/index'):
        task = handle_query.delay(pid, query, idx, data)
        tasks.append(task.id)
    return jsonify({"task_id": tasks}), 202


@celery.task(name='app.handle_query', compression='zlib')
def handle_query(pid, query, idx, data):
    # Handle context passing into get_answer func
    embeddings = OpenAIEmbeddings(openai_api_key=os.environ['OPENAI_API_KEY'])
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

