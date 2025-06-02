from pypdf import PdfReader
import re
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, OpenAI
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain.chains.qa_with_sources import load_qa_with_sources_chain
from prompt import get_prompt
from openai import OpenAI
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI

load_dotenv()


def parse_pdf(file):
    pdf = PdfReader(file)
    output = []
    for page in pdf.pages:
        text = page.extract_text()
        # Merge hyphenated words
        text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
        # Fix newlines in the middle of sentences
        text = re.sub(r"(?<!\n\s)\n(?!\s\n)", " ", text.strip())
        # Remove multiple newlines
        text = re.sub(r"\n\s*\n", "\n\n", text)

        output.append(text)
    print('File parsed successfully')

    return output

def text_to_docs(text):
    if isinstance(text, str):
        text = [text]
    
    page_docs = [Document(page_content=page) for page in text]

    for i, doc in enumerate(page_docs):
        doc.metadata["page"] = i + 1

    doc_chunks = []

    for doc in page_docs:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = 800,
            separators = ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
            chunk_overlap = 0, 
        )

        chunks = text_splitter.split_text(doc.page_content)
        for i, chunk in enumerate(chunks):
            doc = Document(
                page_content = chunk,
                metadata={
                    "page": doc.metadata["page"],
                    "chunk": i,
                }
            ) 
            doc.metadata["source"] = f"{doc.metadata['page']}-{doc.metadata['chunk']}"
            doc_chunks.append(doc)   
    
    return doc_chunks

def embed_docs(docs):
    # embeddings = OpenAIEmbeddings(openai_api_key=os.getenv('OPENAI_API_KEY'), model="text-embedding-3-small")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", task_type="retrieval_document")
    index = FAISS.from_documents(docs, embeddings)
    return index

def search_docs(index, query):
    # embeddings = OpenAIEmbeddings(openai_api_key=os.getenv('OPENAI_API_KEY'), model="text-embedding-3-small")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", task_type="retrieval_query")

    embeded_vector = embeddings.embed_query(query)
    docs = index.similarity_search_by_vector(embeded_vector, k=5)
    return docs

def get_answer(docs, data):
    query, prompt = get_prompt(data)

    # 2. Initialize the Google Generative AI chat model
    # You can choose different models like "gemini-1.5-flash-latest", "gemini-1.5-pro-latest", etc.
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash", # A good general-purpose model
        temperature=0,      # For more deterministic, factual answers
        google_api_key=os.getenv('GOOGLE_API_KEY')
    )

    chain = load_qa_with_sources_chain(
        llm,
        chain_type="stuff",
        prompt=prompt,
    )

    input_payload = {"input_documents": docs, "question": query}
    answer_output = chain(input_payload, return_only_outputs=True)
    
    return answer_output

# project_id = "1"
# location = "us-central1"
# vertexai.init(project=project_id, location=location)

# model = GenerativeModel("gemini-pro")
# chat = model.start_chat()

# def get_chat_response(chat: ChatSession, prompt: str) -> str:
#     response = chat.send_message(prompt)
#     return response.text

model = genai.GenerativeModel('gemini-2.0-flash')

def get_answer_sub(docs, data, chat_obj):
    if not chat_obj:
        chat = model.start_chat(history=[])
    else:
        hist = []
        for i in range(len(chat_obj)):
                hist.append({'role': 'user', 'parts': [chat_obj[i][0]]})
                hist.append({'role': 'model', 'parts': [chat_obj[i][1]]})
        chat = model.start_chat(history=hist)

    chat = model.start_chat(history=[]) #Remove later when fixed
    query, prompt = get_prompt(data)
    response = chat.send_message(prompt.format(
        summaries = docs,
        question = query))
    return response.text
