# api/image_analyze.py
import os
import json
import base64
import httpx
from http.server import BaseHTTPRequestHandler

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_type = self.headers.get('Content-Type', '')
            if 'multipart/form-data' in content_type:
                # Поддержка загрузки файла
                from email.message import Message
                import cgi
                fs = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'POST'})
                fileitem = fs['file']
                img_data = fileitem.file.read()
            else:
                # JSON с base64
                length = int(self.headers['Content-Length'])
                body = json.loads(self.rfile.read(length).decode())
                img_data = base64.b64decode(body.get("image", ""))

            prompt = body.get("prompt", "Опиши это изображение подробно") if 'body' in locals() else "Опиши это изображение"

            b64 = base64.b64encode(img_data).decode()

            url = "https://api.openai.com/v1/chat/completions"
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}}
                        ]
                    }
                ],
                "max_tokens": 500
            }

            with httpx.Client(timeout=90) as client:
                resp = client.post(url, json=payload, headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                })
                resp.raise_for_status()
                text = resp.json()["choices"][0]["message"]["content"]

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"text": text}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
