// Файл: app/api/image/route.js (Replicate - Stable Diffusion)
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

export const POST = async (req) => {
  try {
    const { prompt, nsfw = false } = await req.json();
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_API_TOKEN) {
      return new Response(JSON.stringify({ error: "REPLICATE_API_TOKEN не установлен в окружении." }), { status: 500 });
    }
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt для генерации изображения отсутствует." }), { status: 400 });
    }

    const positivePrompt = nsfw
      ? `A highly detailed, realistic photo of a fully nude woman, extremely seductive pose, volumetric lighting, erotic, cyberpunk style, neon glow. The woman's appearance matches: ${prompt}`
      : `A photorealistic portrait, beautiful face, soft neon lighting, cyberpunk aesthetic, high quality, 8k. The person's appearance matches: ${prompt}` ;
    
    const negativePrompt = "worst quality, low quality, illustration, 3d, 2d, painting, sketch, drawing, extra limbs, deformed, censored, text, signature, low-res, blur, blurry, artifacts";

    // ИСПРАВЛЕНО: Используем стабильный публичный ID версии SDXL (Stability AI)
    const SDXL_MODEL_VERSION = "2b017d915ff76f3d86556b6eac8217e5a2f3e82b79be31463be9826d5254830c"; 
    
    const predictionResponse = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: SDXL_MODEL_VERSION, // Используем исправленную версию
        input: { 
            prompt: positivePrompt,
            negative_prompt: negativePrompt,
            num_outputs: 1,
            width: 1024,
            height: 1024,
        },
      }),
    });

    if (!predictionResponse.ok) {
        const errorData = await predictionResponse.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Replicate API failed to start prediction: ${predictionResponse.status}`;
        throw new Error(errorMessage);
    }

    const prediction = await predictionResponse.json();
    const predictionId = prediction.id;

    if (prediction.error) throw new Error(prediction.error);
    
    // 2. Опрос статуса (Polling)
    let outputUrl = null;
    let status = prediction.status;

    let attempts = 0;
    const MAX_ATTEMPTS = 15; 
    
    while (status !== "succeeded" && status !== "failed" && attempts < MAX_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, 3000)); 
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
        throw new Error("Replicate generation timed out on Vercel (max 45 seconds reached).");
    }

    if (!outputUrl) {
       throw new Error("Image URL not found after generation.");
    }
    
    // 3. Загрузка изображения и возврат в виде Response (Важно: бинарные данные)
    const imageResponse = await fetch(outputUrl);
    if (!imageResponse.ok) throw new Error("Failed to fetch generated image from Replicate.");

    const buffer = await imageResponse.arrayBuffer();
    
    return new Response(buffer, {
      status: 200,
      headers: { "Content-Type": imageResponse.headers.get("Content-Type") || "image/jpeg" }, 
    });

  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown image generation error" }), { status: 500 });
  }
};
