import google.generativeai as genai
from prompt import get_prompt
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS


model = genai.GenerativeModel('gemini-pro')

def genai_embed_docs(docs):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    index = FAISS.from_documents(docs, embeddings)
    return index

def genai_search_docs(index, query):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    embeded_vector = embeddings.embed_query(query)
    docs = index.similarity_search_by_vector(embeded_vector, k=5)
    return docs

def genai_get_answer(docs, data, chat_obj):
    if not chat_obj:
        chat = model.start_chat(history=[])
    else:
        chat = model.start_chat(history=chat_obj)

    query, prompt = get_prompt(data)
    response = chat.send_message(prompt.format(
        summaries = docs,
        question = query))
    return response, chat