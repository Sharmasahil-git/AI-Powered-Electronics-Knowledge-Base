import os
import time
import requests
from typing import List

class EmbeddingGenerator:

    def __init__(self):
        # ===================== INITIALIZE GEMINI API =====================
        # We no longer load a massive local model. We just need the API Key!
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model_name = "models/gemini-embedding-001"

    # ===================== GENERATE SINGLE EMBEDDING =====================
    def generate_embedding(self, text: str) -> List[float]:
        if not text or not text.strip():
            return []
            
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set.")
            
        url = f"https://generativelanguage.googleapis.com/v1beta/{self.model_name}:embedContent?key={self.api_key}"
        payload = {
            "model": self.model_name,
            "content": {
                "parts": [{"text": text}]
            }
        }
        
        print("Fetching single embedding from Gemini API...")
        response = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
        
        if response.status_code == 200:
            return response.json()['embedding']['values']
        else:
            raise Exception(f"Gemini API Error: {response.text}")

    # ===================== GENERATE BATCH EMBEDDINGS =====================
    # This bundles up to 100 paragraphs at a time into a single API request!
    # This guarantees we will never hit the 15-requests-per-minute limit.
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
            
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set.")
            
        url = f"https://generativelanguage.googleapis.com/v1beta/{self.model_name}:batchEmbedContents?key={self.api_key}"
        
        all_embeddings = []
        batch_size = 50  # Lowered from 100 to 50 to avoid TPM (Tokens Per Minute) limit
        
        print(f"Fetching {len(texts)} embeddings from Gemini API in batches of {batch_size}...")
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            
            requests_list = []
            for t in batch_texts:
                requests_list.append({
                    "model": self.model_name,
                    "content": {
                        "parts": [{"text": t}]
                    }
                })
                
            payload = {"requests": requests_list}
            
            print(f"Sending batch {i // batch_size + 1}... (Added 15s delay to prevent hitting 30k TPM limit)")
            response = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                for emb in data['embeddings']:
                    all_embeddings.append(emb['values'])
            else:
                raise Exception(f"Gemini API Batch Error: {response.text}")
                
            # Add a delay between batches to respect the 30k Tokens-Per-Minute free tier limit
            if i + batch_size < len(texts):
                time.sleep(15)
                
        return all_embeddings
