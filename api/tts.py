# tts.py
import httpx
import base64
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

async def text_to_speech(text: str, voice: str = "alloy"):
    """
    Генерация аудио из текста.
    Возвращает raw MP3 bytes.
    """

    url = "https://api.openai.com/v1/audio/speech"

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-4o-mini-tts",
        "voice": voice,
        "input": text
    }

    async with httpx.AsyncClient(timeout=100) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()

        audio_base64 = resp.json()["audio"]
        audio_bytes = base64.b64decode(audio_base64)

        return audio_bytes
