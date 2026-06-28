import os
import base64
import time
import requests
from dotenv import load_dotenv

load_dotenv()

class VisionService:
    def __init__(self):
        # Support multiple keys for load balancing (Key Rotation)
        keys_env = [
            os.getenv("GEMINI_API_KEY", "").strip(),
            os.getenv("GEMINI_API_KEY_2", "").strip(),
            os.getenv("GEMINI_API_KEY_3", "").strip()
        ]
        self.api_keys = [k for k in keys_env if k]
        self.current_key_idx = 0
        self.model_name = "models/gemini-3.1-flash-lite"

    # ===================== AUTOMATIC RETRY & ROTATION LOGIC =====================
    def _make_request_with_retry(self, payload: dict, max_retries=10) -> dict:
        for attempt in range(max_retries):
            try:
                current_key = self.api_keys[self.current_key_idx] if self.api_keys else ""
                url = f"https://generativelanguage.googleapis.com/v1beta/{self.model_name}:generateContent?key={current_key}"
                
                response = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
                
                if response.status_code == 200:
                    return response.json()
                
                if response.status_code == 429:
                    # If we have multiple keys, switch to the next one instantly!
                    if len(self.api_keys) > 1:
                        self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
                        print(f"Vision API Rate Limit hit (429). Rotating to API Key {self.current_key_idx + 1}...")
                        time.sleep(1)
                        continue
                    else:
                        wait_time = 10 * (attempt + 1)
                        print(f"Vision API Rate Limit hit (429). Waiting {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                    
                if response.status_code >= 500:
                    print(f"Google Server Error ({response.status_code}). Retrying in 5s...")
                    time.sleep(5)
                    continue
                    
                raise Exception(f"Vision API Error: {response.text}")

            except requests.exceptions.RequestException as e:
                print(f"Network error in Vision API: {str(e)}. Retrying in 10s...")
                time.sleep(10)
                
        raise Exception("Max retries exceeded for Vision API.")

    def describe_image(self, image_path: str) -> str:
        if not self.api_keys:
            return "Image description unavailable: Missing API Key"

        try:
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        except Exception as e:
            print(f"Error reading image file {image_path}: {e}")
            return "Image description unavailable: Could not read file."

        # Determine MIME type
        mime_type = "image/png"
        if image_path.lower().endswith(".jpg") or image_path.lower().endswith(".jpeg"):
            mime_type = "image/jpeg"

        prompt = "You are an expert Electronics Engineer. Describe this diagram, schematic, or image in extreme technical detail. Mention all labels, pinouts, components, and connections visible."

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": encoded_string
                        }
                    }
                ]
            }]
        }

        try:
            print(f"Asking Gemini to describe image: {image_path}")
            data = self._make_request_with_retry(payload)
            
            # Since we now have multiple keys and automatic rotation, we can drop
            # the massive 4.5s delay down to a tiny 1s polite delay. This makes
            # image processing exponentially faster!
            time.sleep(1)
            
            description = data['candidates'][0]['content']['parts'][0]['text']
            return description
            
        except Exception as e:
            print(f"Vision API Exception: {str(e)}")
            return "Image description unavailable: API Exception."
