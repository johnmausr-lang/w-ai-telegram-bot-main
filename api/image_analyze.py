# image_analyze.py
import os
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

async def analyze_image(file_path: str, prompt: str = "Опиши изображение"):
    """
    Анализ картинки GPT-моделью.
    Возвращает текст.
    """

    url = "https://api.openai.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    with open(file_path, "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode()

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                    {
                        "type": "input_image",
                        "image_url": f"data:image/png;base64,{img_base64}"
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=200) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]
