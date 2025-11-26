# api/image_generate.py
import os
import json
import base64
import httpx
from http.server import BaseHTTPRequestHandler

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(length).decode())

            prompt = body.get("prompt", "")
            size = body.get("size", "1024x1024")

            url = "https://api.openai.com/v1/images/generations"
            payload = {
                "model": "dall-e-3",
                "prompt": prompt,
                "n": 1,
                "size": size,
                "response_format": "b64_json"
            }

            with httpx.Client(timeout=60) as client:
                resp = client.post(url, json=payload, headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                })
                resp.raise_for_status()
                data = resp.json()
                b64 = data["data"][0]["b64_json"]

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"isUrl": False, "data": b64}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
