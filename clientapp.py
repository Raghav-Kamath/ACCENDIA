import urllib.request
import openai
import gradio as gr
import requests
import json

server_host = "http://127.0.0.1:5000"

def download_pdf(url, output_path):
    urllib.request.urlretrieve(url, output_path)


def question_answer(chat_history, url, file, question, openAI_key, project_id='P1'):
    try:
        if openAI_key.strip()=='':
            gr.Warning ('[ERROR]: Please enter your Open AI Key. Get your key here : https://platform.openai.com/account/api-keys')
            return chat_history
        if url.strip() == '' and file is None:
            gr.Warning ('[ERROR]: Both URL and PDF is empty. Provide at least one.')
            return chat_history
        if url.strip() != '' and file is not None:
            gr.Warning ('[ERROR]: Both URL and PDF is provided. Please provide only one (either URL or PDF).')
            return chat_history
        
        
        if url.strip() != '':
            glob_url = url
            download_pdf(glob_url, 'corpus.pdf')
        else:
            print(file)
            r = requests.post(
                url="{}/api/upload/{}".format(server_host, project_id),
                files={'file': open(file.name, 'rb')},
            )
            if r.status_code == 202:
                gr.Info(f'[INFO]: {r.text}')
            else:
                gr.Warning(f'[ERROR]: {r.text}')
                return chat_history
            
            # File successfully given for upload
    
    except openai.OpenAIError as e:
        gr.Warning(e)
        return
    
def get_query(chat_history, url, question, openAI_key, model, project_id='P1'):
    try:
        if model is None or model =='':
                gr.Warning ('[ERROR]: You have not selected any model. Please choose an LLM model.')
                return chat_history
        if question.strip() == '':
            gr.Warning( '[ERROR]: Question field is empty')
            return
        
        _data = {"prompt": question,
                      "chat_history": chat_history
                      }
        r = requests.post(
                url="{}/api/{}/{}/query".format(server_host, model, project_id),
                json= {**_data},
            )
            
        print(r.json())
        answer = r.json()['payload']
        answer = '\n\n'.join(i for i in answer)
        print(answer)
            # answer = generate_answer_text_davinci_003(question, openAI_key)
        
        print(chat_history)
        chat_history.append([question, answer])
        print(chat_history)
    except Exception as e:
        gr.Warning(e)

    return chat_history


# pre-defined questions
questions = [
    "What did the study investigate?",
    "Can you provide a summary of this paper?",
    "what are the methodologies used in this study?",
    "what are the data intervals used in this study? Give me the start dates and end dates?",
    "what are the main limitations of this study?",
    "what are the main shortcomings of this study?",
    "what are the main findings of the study?",
    "what are the main results of the study?",
    "what are the main contributions of this study?",
    "what is the conclusion of this paper?",
    "what are the input features used in this study?",
    "what is the dependent variable in this study?",
]


title = 'ACCENDIA'
description = """Advanced Chatbot for Customized Engagement and Navigation in Database Interaction"""

with gr.Blocks(css="""#chatbot { font-size: 14px; min-height: 1200; }""") as demo:

    gr.Markdown(f'<center><h3>{title}</h3></center>')
    gr.Markdown(description)

    with gr.Row():
        
        with gr.Group():
            gr.Markdown(f'<p style="text-align:center">Get your Open AI API key <a href="https://platform.openai.com/account/api-keys">here</a></p>')
            with gr.Accordion("API Key"):
                openAI_key = gr.Textbox(label='Enter your OpenAI API key here', type="text", value= "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")
                project_id = gr.Textbox(label="Enrter your Project ID/Name", type='text')
                url = gr.Textbox(label='Enter PDF URL here   (Example: https://arxiv.org/pdf/1706.03762.pdf )')
                gr.Markdown("<center><h4>OR<h4></center>")
                file = gr.File(label='Upload your PDF/ Research Paper / Book here', file_types=['.pdf'])
            
            btn = gr.Button(value='Submit File')


        with gr.Group():
            chatbot = gr.Chatbot(value=[["Question","Answer"]], label="Chat History", elem_id="chatbot")
            question = gr.Textbox(label='Enter your question here', value="Tell about this file")
            gr.Examples(
                [[q] for q in questions],
                inputs=[question],
                label="PRE-DEFINED QUESTIONS: Click on a question to auto-fill the input box, then press Enter!",
            )
            model = gr.Radio([
                'gpt', 
                'gemini'
            ], label='Select Model', value='gpt')
            btn2 = gr.Button(value="Submit Question")


    # Bind the click event of the button to the question_answer function
    btn.click(
        question_answer,
        inputs=[chatbot, url, file, question, openAI_key],
        outputs=chatbot,
    )

    btn2.click(
        get_query,
        inputs=[chatbot, url, question, openAI_key, model],
        outputs=chatbot,
    )

    demo.launch()
