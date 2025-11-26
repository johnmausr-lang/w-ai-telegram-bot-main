# stt.py
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

async def speech_to_text(file_path: str):
    """
    Распознаёт речь из аудиофайла.
    file_path — путь к .mp3, .wav, .ogg
    """

    url = "https://api.openai.com/v1/audio/transcriptions"

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    async with httpx.AsyncClient(timeout=100) as client:
        with open(file_path, "rb") as f:
            files = {"file": (file_path, f, "audio/mpeg")}
            data = {"model": "gpt-4o-mini-transcribe"}

            resp = await client.post(url, data=data, files=files, headers=headers)
            resp.raise_for_status()

            return resp.json()["text"]
