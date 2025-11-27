// app/api/image/route.js — 100% РАБОЧАЯ ВЕРСИЯ (ноябрь 2025)
export const POST = async (req) => {
  try {
    const { prompt, nsfw = false } = await req.json();
    const token = process.env.REPLICATE_API_TOKEN?.trim();

    if (!token) {
      console.error("REPLICATE_API_TOKEN missing!");
      return new Response(JSON.stringify({ error: "Replicate key missing" }), { status: 500 });
    }

    if (!prompt) return new Response("No prompt", { status: 400 });

    const fullPrompt = nsfw
      ? `masterpiece, ultra realistic, 8k, nude seductive woman, neon cyberpunk lights, erotic pose, detailed skin, wet, ${prompt}`
      : `masterpiece, beautiful woman, cyberpunk neon aesthetic, glowing makeup, cinematic lighting, ${prompt}`;

    const negative = "blurry, ugly, deformed, extra limbs, censored, text, watermark, low quality, child";

    console.log("Starting Replicate generation...");

    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "c6a2372b14619d80d19f1870a4409549f7e6f9a65d1d6428c0499e69c0540d6c", // SDXL
        input: {
          prompt: fullPrompt,
          negative_prompt: negative,
          width: 768,
          height: 1024,
          num_inference_steps: 28,
          guidance_scale: 7.5,
        },
      }),
    });

    const result = await prediction.json();

    if (result.error) {
      console.error("Replicate error:", result.error);
      return new Response(JSON.stringify({ error: result.error }), { status: 500 });
    }

    const id = result.id;

    // Ждём максимум 40 секунд
    let final;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { Authorization: `Token ${token}` },
      });
      final = await poll.json();

      if (final.status === "succeeded") {
        const imageUrl = final.output[0];
        const imgRes = await fetch(imageUrl);
        return new Response(imgRes.body, { headers: { "Content-Type": "image/jpeg" } });
      }
      if (final.status === "failed") {
        console.error("Replicate failed:", final.error);
        return new Response(JSON.stringify({ error: "Generation failed" }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ error: "Timeout" }), { status: 504 });

  } catch (e) {
    console.error("Image API crashed:", e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
