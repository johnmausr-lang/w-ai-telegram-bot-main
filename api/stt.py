# stt.py
import os
import json
import base64
import tempfile
import httpx
from dotenv import load_dotenv
from http.server import BaseHTTPRequestHandler

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def speech_to_text(file_data_b64: str):
    """
    Распознаёт речь из аудиофайла, переданного как base64 строка.
    """
    
    url = "https://api.openai.com/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    
    # 1. Декодируем base64 данные и сохраняем во временный файл
    audio_bytes = base64.b64decode(file_data_b64)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
        tmp_file.write(audio_bytes)
        temp_path = tmp_file.name

    try:
        # 2. Отправляем временный файл в OpenAI
        with httpx.Client(timeout=100) as client:
            with open(temp_path, "rb") as f:
                # ВАЖНО: Модель для транскрипции - whisper-1
                files = {"file": (os.path.basename(temp_path), f, "audio/mpeg")}
                data = {"model": "whisper-1"} 

                resp = client.post(url, data=data, files=files, headers=headers)
                resp.raise_for_status()

                return resp.json()["text"]
    finally:
        # 3. Удаляем временный файл
        os.remove(temp_path)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        body = json.loads(self.rfile.read(length))
        
        file_data_b64 = body.get("file_data_b64", "")

        try:
            if not file_data_b64:
                raise ValueError("Missing file_data_b64 in request body.")

            transcribed_text = speech_to_text(file_data_b64)
            response = {"text": transcribed_text}
            self.send_response(200)
        except Exception as e:
            response = {"error": f"STT Error: {str(e)}"}
            self.send_response(500)

        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
