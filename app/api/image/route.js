// Файл: app/api/image/route.js
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

export const POST = async (req) => {
  try {
    const { prompt, nsfw = false } = await req.json();
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!prompt || !REPLICATE_API_TOKEN) {
      return new Response("Prompt or API Token is missing", { status: 400 });
    }

    // ИСПРАВЛЕНИЕ: Используем бесцензурные промпты для NSFW-моделей
    const positivePrompt = nsfw
      ? `A highly detailed, realistic photo of a fully nude woman, extremely seductive pose, volumetric lighting, erotic, cyberpunk style, neon glow. The woman's appearance matches: ${prompt}`
      : `A photorealistic portrait, beautiful face, soft neon lighting, cyberpunk aesthetic, high quality, 8k. The person's appearance matches: ${prompt}`;
    
    // Отрицательный промпт - ключевой для качества Stable Diffusion
    const negativePrompt = "worst quality, low quality, illustration, 3d, 2d, painting, sketch, drawing, extra limbs, deformed, censored, text, signature";

    // 1. Запуск генерации (Создание prediction)
    const predictionResponse = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        // Выбираем мощную NSFW-совместимую модель (например, SDXL)
        version: "c6a2372b14619d80d19f1870a4409549f7e6f9a65d1d6428c0499e69c0540d6c", // Версия SDXL
        input: {
          prompt: positivePrompt,
          negative_prompt: negativePrompt,
          width: 768,
          height: 768,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 25,
          guidance_scale: 7.5,
        },
      }),
    });

    const prediction = await predictionResponse.json();
    const predictionId = prediction.id;

    if (prediction.error) throw new Error(prediction.error);
    
    // 2. Опрос статуса (Polling)
    let outputUrl = null;
    let status = prediction.status;

    while (status !== "succeeded" && status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Ждем 3 секунды
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

    if (!outputUrl) {
       throw new Error("Image URL not found after generation.");
    }
    
    // 3. Загрузка изображения и возврат в виде Response
    const imageResponse = await fetch(outputUrl);
    if (!imageResponse.ok) throw new Error("Failed to fetch generated image.");

    // Возвращаем изображение как Response с правильным заголовком
    return new Response(imageResponse.body, {
      headers: { 
        "Content-Type": "image/jpeg", // Replicate часто возвращает JPEG
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
