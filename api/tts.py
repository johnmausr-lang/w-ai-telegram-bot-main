# api/tts.py
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
            text = body.get("text", "")
            voice = body.get("voice", "alloy")

            with httpx.Client(timeout=60) as client:
                resp = client.post(
                    "https://api.openai.com/v1/audio/speech",
                    json={"model": "tts-1", "voice": voice, "input": text},
                    headers={"Authorization": f"Bearer {OPENAI_API_KEY}"}
                )
                resp.raise_for_status()

            audio_b64 = base64.b64encode(resp.content).decode()

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"isUrl": False, "data": audio_b64}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
