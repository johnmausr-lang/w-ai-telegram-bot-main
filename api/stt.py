# api/stt.py
import os
import json
import httpx
from http.server import BaseHTTPRequestHandler

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            import cgi
            fs = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'POST'})
            fileitem = fs['file']
            audio_file = fileitem.file

            with httpx.Client(timeout=90) as client:
                files = {"file": ("audio.mp3", audio_file, "audio/mpeg")}
                data = {"model": "whisper-1"}
                resp = client.post(
                    "https://api.openai.com/v1/audio/transcriptions",
                    data=data,
                    files=files,
                    headers={"Authorization": f"Bearer {OPENAI_API_KEY}"}
                )
                resp.raise_for_status()
                text = resp.json()["text"]

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"text": text}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
