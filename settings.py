from kombu import Queue, Exchange

imports = 'celery'
task_track_started = True
task_default_delivery_mode = 'transient'
broker_connection_retry_on_startup = True


task_queues = (
    Queue('files_list', Exchange('files_list'), routing_key='files_list'),
    Queue('pdf_content', Exchange('pdf_content'), routing_key='pdf_content'),
    Queue('query_list', Exchange('query_list'), routing_key='query_list')

)

task_routes = {
    'app.upload_pdf': {
        'queue': 'files_list',
        'routing_key': 'files_list'
    },
    'app.extract_content': {
        'queue': 'pdf_content',
        'routing_key': 'pdf_content'
    },
    'app.handle_query': {
        'queue': 'query_list',
        'routing_key': 'query_list'
    }

}
