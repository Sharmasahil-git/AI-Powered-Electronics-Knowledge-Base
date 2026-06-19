import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY", "").strip()

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    for model in data.get('models', []):
        if 'gemma' in model['name'].lower():
            print(model['name'])
else:
    print("Error fetching models:", response.text)
