# image_generate.py
import os
import json
import base64
import httpx
from dotenv import load_dotenv
from http.server import BaseHTTPRequestHandler

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def generate_image(prompt: str, size: str = "1024x1024"):
    """
    Генерация изображения по тексту. Возвращает base64 строку изображения PNG.
    """

    url = "https://api.openai.com/v1/images/generations"

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        # ФИКС: Используем DALL-E 3
        "model": "dall-e-3", 
        "prompt": prompt,
        "size": size,
        "response_format": "b64_json", # Запрашиваем данные в base64
        "n": 1
    }

    with httpx.Client(timeout=200) as client:
        resp = client.post(url, json=payload, headers=headers)
        resp.raise_for_status()

        # Возвращаем base64 строку
        image_base64 = resp.json()["data"][0]["b64_json"]
        return image_base64

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        body = json.loads(self.rfile.read(length))
        
        prompt = body.get("prompt", "")
        size = body.get("size", "1024x1024")

        try:
            if not prompt:
                raise ValueError("Missing prompt in request body.")
                
            image_b64 = generate_image(prompt, size)
            # Фронтенд ожидает b64_json, флаг isUrl: False
            response = {"isUrl": False, "data": image_b64} 
            self.send_response(200)
        except Exception as e:
            response = {"error": f"Image Generation Error: {str(e)}"}
            self.send_response(500)

        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
