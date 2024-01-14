from pypdf import PdfReader
from langchain.docstore.document import Document

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


    