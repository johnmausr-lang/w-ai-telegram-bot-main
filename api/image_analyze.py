# image_analyze.py
import os
import json
import base64
import httpx
from dotenv import load_dotenv
from http.server import BaseHTTPRequestHandler

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def analyze_image(file_data_b64: str, prompt: str = "Опиши изображение"):
    """
    Анализ картинки GPT-моделью.
    """

    url = "https://api.openai.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    # ФИКС: Используем правильную структуру для Vision API
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{file_data_b64}"
                        }
                    }
                ]
            }
        ]
    }

    with httpx.Client(timeout=200) as client:
        resp = client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        body = json.loads(self.rfile.read(length))
        
        file_data_b64 = body.get("file_data_b64", "")
        prompt = body.get("prompt", "Опиши изображение")

        try:
            if not file_data_b64:
                raise ValueError("Missing file_data_b64 in request body.")

            analysis_text = analyze_image(file_data_b64, prompt)
            response = {"text": analysis_text}
            self.send_response(200)
        except Exception as e:
            response = {"error": f"Image Analysis Error: {str(e)}"}
            self.send_response(500)

        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
