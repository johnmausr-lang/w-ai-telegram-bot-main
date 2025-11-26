# image_generate.py
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

async def generate_image(prompt: str, size: str = "1024x1024"):
    """
    Генерация изображения по тексту.
    Возвращает bytes изображения PNG.
    """

    url = "https://api.openai.com/v1/images/generations"

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-image-1",
        "prompt": prompt,
        "size": size
    }

    async with httpx.AsyncClient(timeout=200) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()

        image_base64 = resp.json()["data"][0]["b64_json"]
        return base64.b64decode(image_base64)
