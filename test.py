import requests
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
print(api_key)
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "input": "test string",
    "model": "text-embedding-ada-002"
}

r = requests.post("https://api.openai.com/v1/embeddings", headers=headers, json=data)
print(r.status_code)
print(r.text)
