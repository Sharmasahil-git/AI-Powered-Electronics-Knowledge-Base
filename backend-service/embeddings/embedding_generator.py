import os
import time
import requests
from typing import List

class EmbeddingGenerator:

    def __init__(self):
        # ===================== INITIALIZE GEMINI API =====================
        # Support multiple keys for load balancing (Key Rotation)
        keys_env = [
            os.getenv("GEMINI_API_KEY", "").strip(),
            os.getenv("GEMINI_API_KEY_2", "").strip(),
            os.getenv("GEMINI_API_KEY_3", "").strip()
        ]
        self.api_keys = [k for k in keys_env if k]
        self.current_key_idx = 0
        self.model_name = "models/gemini-embedding-001"

    # ===================== AUTOMATIC RETRY LOGIC =====================
    # ===================== AUTOMATIC RETRY & ROTATION LOGIC =====================
    def _make_request_with_retry(self, url_template: str, payload: dict, max_retries=10) -> dict:
        for attempt in range(max_retries):
            try:
                current_key = self.api_keys[self.current_key_idx] if self.api_keys else ""
                url = url_template.format(api_key=current_key)
                
                response = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
                
                if response.status_code == 200:
                    return response.json()
                
                if response.status_code == 429:
                    # If we have multiple keys, switch to the next one instantly!
                    if len(self.api_keys) > 1:
                        self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
                        print(f"API Rate Limit hit (429). Rotating to API Key {self.current_key_idx + 1}...")
                        time.sleep(1) # Small pause to prevent hammering if all keys are exhausted
                        continue
                    else:
                        wait_time = 10 * (attempt + 1)
                        print(f"API Rate Limit hit (429). Waiting {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                    
                if response.status_code >= 500:
                    print(f"Google Server Error ({response.status_code}). Retrying in 5s...")
                    time.sleep(5)
                    continue
                    
                raise Exception(f"Gemini API Error: {response.text}")

            except requests.exceptions.RequestException as e:
                print(f"Network error: {str(e)}. Retrying in 10s...")
                time.sleep(10)
                
        raise Exception("Max retries exceeded. The API is consistently blocking the request.")


    # ===================== GENERATE SINGLE EMBEDDING =====================
    def generate_embedding(self, text: str) -> List[float]:
        if not text or not text.strip():
            return []
            
        if not self.api_keys:
            raise ValueError("GEMINI_API_KEY is not set.")
            
        url_template = f"https://generativelanguage.googleapis.com/v1beta/{self.model_name}:embedContent?key={{api_key}}"
        payload = {
            "model": self.model_name,
            "content": {
                "parts": [{"text": text}]
            }
        }
        
        print("Fetching single embedding from Gemini API...")
        data = self._make_request_with_retry(url_template, payload)
        return data['embedding']['values']


    # ===================== GENERATE BATCH EMBEDDINGS =====================
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
            
        if not self.api_keys:
            raise ValueError("GEMINI_API_KEY is not set.")
            
        url_template = f"https://generativelanguage.googleapis.com/v1beta/{self.model_name}:batchEmbedContents?key={{api_key}}"
        
        all_embeddings = []
        batch_size = 50 
        
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
            
            print(f"Sending batch {i // batch_size + 1}...")
            data = self._make_request_with_retry(url_template, payload)
            
            for emb in data['embeddings']:
                all_embeddings.append(emb['values'])
                
            # Since we now have key rotation, we can run at maximum speed!
            # The backend will automatically switch keys or pause if it hits the limit.
                
        return all_embeddings
