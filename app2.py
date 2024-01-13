from flask import Flask, render_template, request
from langchain.docstore.document import Document
from langchain.embeddings import HuggingFaceInstructEmbeddings
from langchain.text_splitter import Language, RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
import streamlit as st
import os
EMBEDDING_MODEL_NAME = "hkunlp/instructor-large" 
DEVICE_TYPE = "cpu" # "gpu" or "mps"
# Initialize your Flask app
app = Flask(__name__)
def split_documents(documents: list[Document]) -> tuple[list[Document], list[Document]]:
    # Splits documents for correct Text Splitter
    text_docs, python_docs = [], []
    for doc in documents:
        if doc is not None:
           file_extension = os.path.splitext(doc.metadata["source"])[1]
           if file_extension == ".py":
               python_docs.append(doc)
           else:
               text_docs.append(doc)
    return text_docs, python_docs

def store_in_vectorbase(splitted_chunks):
    # Define the HuggingFaceInstructEmbeddings
    embeddings = HuggingFaceInstructEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": DEVICE_TYPE},
    )

    # Store chunks in the Chroma DB
    db = st.session_state.DB  # Access the Chroma DB from the Streamlit session state

    # Convert each split chunk into embeddings and store in the DB
    for chunk in splitted_chunks:
        # Assuming 'chunk' is a text string representing a single chunk of data
        # Get embeddings for the chunk
        chunk_embeddings = embeddings.encode_text(chunk)
        
        # Store the embeddings in the Chroma DB
        db.store(chunk_embeddings)


# Route for handling file upload
@app.route('/upload', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        # Access the uploaded file
        uploaded_file = request.files['file']
        if uploaded_file:
            # Process the file using LangChain (Assuming 'split_documents' function is defined)
            processed_chunks = split_documents(uploaded_file)
            
            # Store chunks in the vectorbase (assuming 'store_in_vectorbase' function is defined)
            store_in_vectorbase(processed_chunks)
            
            return 'File uploaded and processed successfully!'
    
    return 'Failed to process the file.'

if __name__ == '__main__':
    app.run(debug=True)
