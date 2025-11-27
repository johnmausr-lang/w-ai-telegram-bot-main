// Файл: app/api/image/route.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Используем метод POST для обработки запроса
export const POST = async (req) => {
  try {
    const { prompt, nsfw = false } = await req.json();
    
    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    // Улучшаем и конкретизируем промпт для DALL-E-3
    const fullPrompt = nsfw
      ? `A highly detailed, realistic photo of a fully nude woman, extremely seductive pose, volumetric lighting, erotic, cyberpunk style, neon glow. The woman's appearance matches: ${prompt}`
      : `A photorealistic portrait, beautiful face, soft neon lighting, cyberpunk aesthetic. The person's appearance matches: ${prompt}`;

    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      size: "1024x1024",
      response_format: "b64_json",
      // Установка style: "vivid" или "natural" может помочь, но оставим по умолчанию для гибкости
    });

    // Получаем base64-строку и конвертируем ее в Buffer
    const base64Image = result.data[0].b64_json;
    const buffer = Buffer.from(base64Image, "base64");

    // Возвращаем изображение как Response с правильным заголовком
    return new Response(buffer, {
      headers: { 
        "Content-Type": "image/png",
        "Cache-Control": "no-store"
      },
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(JSON.stringify({ error: "Image generation failed" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
