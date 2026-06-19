import os
import base64
import time
import requests
from dotenv import load_dotenv

load_dotenv()

class VisionService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model_name = "models/gemini-3.1-flash-lite"
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/{self.model_name}:generateContent?key={self.api_key}"

    def describe_image(self, image_path: str) -> str:
        if not self.api_key:
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
            response = requests.post(self.api_url, headers={'Content-Type': 'application/json'}, json=payload)
            
            # Add a 4.5 second delay to stay under the 15 Requests-Per-Minute (RPM) free tier limit (60s / 15 = 4s)
            time.sleep(4.5)
            
            if response.status_code == 200:
                data = response.json()
                description = data['candidates'][0]['content']['parts'][0]['text']
                return description
            else:
                print(f"Vision API Error: {response.text}")
                return "Image description unavailable: API Error."
        except Exception as e:
            print(f"Vision API Exception: {str(e)}")
            return "Image description unavailable: API Exception."
