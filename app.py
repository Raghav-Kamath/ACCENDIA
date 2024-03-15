from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import config
from utils import parse_pdf, text_to_docs, embed_docs, search_docs, get_answer, get_answer_sub
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from openai import OpenAIError
from celery import Celery
from celery.result import AsyncResult
from flask_caching import Cache

app = Flask(__name__)
app.secret_key = config.SECRET_KEY
CORS(app, origins="*", methods=['GET', 'POST', 'OPTIONS'])
broker_host = os.getenv('RABBITMQ_HOST', 'localhost')
app.config['CELERY_BROKER_URL'] = 'amqp://guest@localhost:5672//'
app.config['CELERY_RESULT_BACKEND'] = 'db+postgresql://app:app@localhost:5432/celery'
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'], backend=app.config['CELERY_RESULT_BACKEND'])
celery.conf.update(app.config)
celery.config_from_object('settings')
cache = Cache()


def generate_cache_key(data):
    cache_key_data = [data]
    cache_key = ":".join(str(item) for item in cache_key_data)

    return cache_key

@app.route('/api/upload/<model>/<project_id>', methods=['POST'])
def upload_task(model, project_id):
    app.logger.info("Request files below")
    app.logger.info(request.files)
    pid = project_id
    files = request.files.getlist('file')
    session['model'] = model
    if pid == '':
        return jsonify({"content": "Error: Empty pid"}), 400
    for file in files:
        if file.filename == '':
            return jsonify({"content": "Error: Empty file"}), 400

    result = upload_pdf(files, pid, model)
    return jsonify({"content": "File is being uploaded and extracted", 'tasks': result}), 202


@celery.task(name='app.upload_pdf', compression='zlib')
def upload_pdf(files, pid, model):
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
        task = extract_content.delay({'filepath': filepath}, pid, model)
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

@app.route('/api/<model>/<projectID>/query', methods=['POST'])
def query_task(projectID, model):
    data = request.get_json()
    tasks = []
    model_type = model
    pid, query = projectID, data['prompt']
    hist = data['chat_history']
    if pid == '':
        raise Exception('Error: Empty pid')
    if not os.path.exists('./data/'+pid+'/index'):
        raise Exception('Error: Index not found')

    for idx in os.listdir('./data/'+pid+'/index'):
        # task = handle_query.delay(pid, query, idx, data)
        task = handle_query(pid, query, idx, data, model_type, hist)
        tasks.append(task)
        print("TASK IS ",tasks)
    return jsonify({"payload": tasks}), 202
    # return task, 202



#OpenAI_Handle query
@celery.task(name='app.handle_query', compression='zlib')
def handle_query(pid, query, idx, data, model='gpt', hist=None):
    # Handle context passing into get_answer func
    embeddings = OpenAIEmbeddings(openai_api_key=os.environ['OPENAI_API_KEY'])
    index = FAISS.load_local('./data/'+pid+'/index/'+idx, embeddings)
    sources = search_docs(index, query)
    messages =[]
    # FOR GENAI IMPLEMENTATION
    if model=='gemini':
        try:
            # cache_key = generate_cache_key(query)
            # output = cache.get(cache_key)
            # if not (output is None):
                # return jsonify(output)
            
            answer = get_answer_sub(sources, data, hist)
            # answer = get_answer_sub(sources, data)
            
            # for m in chat.history:
            #     messages.append({'role':m.role, 'parts':[m.parts[0].text]})
            session['chat_obj'] = messages
            app.logger.info("Sources", sources)
            app.logger.info("Answers", answer)

            #caching starts
            # cache.set(cache_key, answer)
            # print(cache_key, output)

        except OpenAIError as e:
            app.logger.error(e._message)

        return answer
    # response = {
    #     # 'content': answer["output_text"].split("SOURCES: ")[0],
    #     'content': answer,
    # }
    
    #GENAI IMPL ENDS HERE
    #OPENAI IMPL BEGINS
    else:
        try:
            answer = get_answer(sources, data)
            app.logger.info("Sources", sources)
            app.logger.info("Answers", answer)
        except OpenAIError as e:
            app.logger.error(e._message)

        return answer["output_text"]
        # response = {
        #     'content': answer["output_text"].split("SOURCES: ")[0],
        # }
    # return response


@app.route("/api/tasks/<task_id>", methods=['GET'])
def get_status(task_id):
    task = AsyncResult(task_id, app=celery)
    if task.state == 'PENDING':
        # job did not start yet
        response = {
            'state': task.state,
            "task_id": task_id,
            "task_result": "Pending"
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            "task_id": task_id,
            "task_status": task.status,
            "task_result": task.result
        }
        if 'result' in task.info:
            response['result'] = task.result
    else:
        # something went wrong in the background job
        response = {
            'state': task.state,
            'current': 1,
            'status': str(task.info),  # this is the exception raised
        }
    return jsonify(response)


if __name__ == '__main__':
    app.config['CACHE_TYPE'] = 'simple'
    app.config['CACHE_DEFAULT_TIMEOUT'] = 0  # Persistent cache
    cache.init_app(app)
    app.run(host='0.0.0.0',port=8000,debug=True)

