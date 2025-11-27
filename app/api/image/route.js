// app/api/image/route.js
const REPLICATE_API = "https://api.replicate.com/v1/predictions";

export const POST = async (req) => {
  try {
    const { prompt, nsfw = false } = await req.json();
    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) return new Response("Replicate token missing", { status: 500 });
    if (!prompt) return new Response("No prompt", { status: 400 });

    const basePrompt = nsfw
      ? `masterpiece, best quality, ultra-detailed, realistic, nude seductive woman, cyberpunk neon lights, erotic pose, wet skin, volumetric fog, ${prompt}`
      : `masterpiece, beautiful woman, cyberpunk neon aesthetic, glowing makeup, detailed face, cinematic lighting, ${prompt}`;

    const negative = "blurry, ugly, deformed, extra limbs, censored, text, watermark, low quality";

    const predictionRes = await fetch(REPLICATE_API, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "c6a2372b14619d80d19f1870a4409549f7e6f9a65d1d6428c0499e69c0540d6c", // SDXL
        input: {
          prompt: basePrompt,
          negative_prompt: negative,
          width: 768,
          height: 1024,
          num_inference_steps: 28,
          guidance_scale: 7.5,
          scheduler: "K_EULER",
        },
      }),
    });

    const prediction = await predictionRes.json();
    if (prediction.error) throw new Error(prediction.error);

    const id = prediction.id;

    // Polling до готовности
    let result;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const poll = await fetch(`${REPLICATE_API}/${id}`, {
        headers: { Authorization: `Token ${token}` },
      });
      result = await poll.json();
      if (result.status === "succeeded" || result.status === "failed") break;
    }

    if (result.status !== "succeeded" || !result.output?.[0]) {
      throw new Error("Generation failed");
    }

    const imageUrl = result.output[0];
    const imageRes = await fetch(imageUrl);
    return new Response(imageRes.body, {
      headers: { "Content-Type": "image/jpeg" },
    });
  } catch (e) {
    console.error("Image Error:", e);
    return new Response(JSON.stringify({ error: "Image generation failed" }), { status: 500 });
  }
};
