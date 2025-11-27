// Файл: app/api/image/route.js (Replicate - Stable Diffusion)
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

export const POST = async (req) => {
  try {
    const { prompt, nsfw = false } = await req.json();
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      // ИЗМЕНЕНО: Более информативная ошибка
      return new Response(JSON.stringify({ error: "REPLICATE_API_TOKEN не установлен в окружении." }), { status: 500 });
    }
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt для генерации изображения отсутствует." }), { status: 400 });
    }

    // Использование бесцензурных промптов для NSFW-моделей
    const positivePrompt = nsfw
      ? `A highly detailed, realistic photo of a fully nude woman, extremely seductive pose, volumetric lighting, erotic, cyberpunk style, neon glow. The woman's appearance matches: ${prompt}`
      : `A photorealistic portrait, beautiful face, soft neon lighting, cyberpunk aesthetic, high quality, 8k. The person's appearance matches: ${prompt}` ;
    
    const negativePrompt = "worst quality, low quality, illustration, 3d, 2d, painting, sketch, drawing, extra limbs, deformed, censored, text, signature, low-res, blur";

    // 1. Запуск генерации (Создание prediction)
    const predictionResponse = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        // Используем быструю модель (если SDXL-Turbo, можно убрать Polling)
        version: "c9f564177d00f33d26ffb0b7548b269c735235552b7b049211a7a2e5d59042b3", // Пример ID версии SDXL-Turbo
        input: { 
            prompt: positivePrompt,
            negative_prompt: negativePrompt,
            num_outputs: 1,
            // Дополнительные параметры
        },
        // 'webhook' : 'YOUR_WEBHOOK_URL' // Для продакшн Vercel лучше использовать webhook!
      }),
    });

    if (!predictionResponse.ok) {
        const errorText = await predictionResponse.text();
        throw new Error(`Replicate API failed to start prediction: ${errorText}`);
    }

    const prediction = await predictionResponse.json();
    const predictionId = prediction.id;

    if (prediction.error) throw new Error(prediction.error);
    
    // 2. Опрос статуса (Polling - Внимание: Риск таймаута на Vercel!)
    let outputUrl = null;
    let status = prediction.status;

    // ВНИМАНИЕ: Если вы используете медленную модель, Vercel Serverless Function может завершиться по таймауту.
    // Если проблема с "Нет Фото" сохранится после этого фикса, вам нужно перейти на Webhook или другой, более быстрый API.
    let attempts = 0;
    const MAX_ATTEMPTS = 15; // 15 попыток * 3 секунды = 45 секунд лимит Vercel
    
    while (status !== "succeeded" && status !== "failed" && attempts < MAX_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Ждём 3 секунды
      attempts++;
      
      const pollResponse = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: { "Authorization": `Token ${REPLICATE_API_TOKEN}` }
      });
      const pollData = await pollResponse.json();
      status = pollData.status;

      if (status === "succeeded" && pollData.output && pollData.output.length > 0) {
        outputUrl = pollData.output[0];
      } else if (status === "failed" || status === "canceled") {
        throw new Error(`Replicate generation failed: ${pollData.error || status}`);
      }
    }
    
    if (attempts >= MAX_ATTEMPTS) {
        throw new Error("Replicate generation timed out on Vercel.");
    }

    if (!outputUrl) {
       throw new Error("Image URL not found after generation.");
    }
    
    // 3. Загрузка изображения и возврат в виде Response (Важно: бинарные данные)
    const imageResponse = await fetch(outputUrl);
    if (!imageResponse.ok) throw new Error("Failed to fetch generated image from Replicate.");

    // Возвращаем изображение в виде ArrayBuffer/Blob
    const buffer = await imageResponse.arrayBuffer();
    
    return new Response(buffer, {
      status: 200,
      // ВАЖНО: Указываем правильный MIME-тип
      headers: { "Content-Type": imageResponse.headers.get("Content-Type") || "image/jpeg" }, 
    });

  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown image generation error" }), { status: 500 });
  }
};
