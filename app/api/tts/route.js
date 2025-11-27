// Файл: app/api/tts/route.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Используем метод POST для обработки запроса
export const POST = async (req) => {
  try {
    // Получаем данные из тела запроса
    const { text, voice = "nova" } = await req.json();

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }
    
    // Ограничиваем текст 1000 символами
    const safeText = text.slice(0, 1000); 

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: safeText,
    });

    // Конвертируем ArrayBuffer в Buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Возвращаем аудиофайл как Response с правильным заголовком
    return new Response(buffer, {
      headers: { 
        "Content-Type": "audio/mpeg",
        // Добавление заголовков для предотвращения проблем с кешированием/CORS, если это необходимо
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    // Возвращаем Response с ошибкой
    return new Response("TTS failed", { status: 500 });
  }
};
