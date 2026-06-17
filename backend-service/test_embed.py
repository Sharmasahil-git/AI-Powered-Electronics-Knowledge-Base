import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY", "").strip()

models_to_test = [
    "models/text-embedding-004",
    "models/embedding-001",
    "models/gemini-embedding-001"
]

for model in models_to_test:
    url = f"https://generativelanguage.googleapis.com/v1beta/{model}:embedContent?key={api_key}"
    payload = {
        "model": model,
        "content": {
            "parts": [{"text": "Hello world"}]
        }
    }
    print(f"\nTesting {model}...")
    response = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}")
