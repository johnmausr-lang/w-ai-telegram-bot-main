from http.server import BaseHTTPRequestHandler
import json
import requests

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        body = json.loads(self.rfile.read(length))

        text = body.get("text")

        resp = requests.post(
            "https://horde.koboldai.net/api/v2/generate/text",
            json={
                "prompt": text,
                "params": {
                    "max_length": 200,
                    "temperature": 0.9
                }
            }
        ).json()

        message = resp["generations"][0]["text"]

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"reply": message}).encode())
