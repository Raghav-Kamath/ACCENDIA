from pypdf import PdfReader
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

def parse_pdf(file):
    pdf = PdfReader
    output = []
    for page in pdf.pages:
        text = page.extract_content()
        # Merge hyphenated words
        text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
        # Fix newlines in the middle of sentences
        text = re.sub(r"(?<!\n\s)\n(?!\s\n)", " ", text.strip())
        # Remove multiple newlines
        text = re.sub(r"\n\s*\n", "\n\n", text)

        output.append(text)

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