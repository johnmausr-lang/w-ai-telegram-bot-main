// app/api/image/route.js — Horde AI (бесплатно + без цензуры + быстро)
export const POST = async (req) => {
  try {
    const { prompt, nsfw = false } = await req.json();

    if (!prompt) return new Response("No prompt", { status: 400 });

    const fullPrompt = nsfw
      ? `${prompt}, nude, erotic, seductive pose, ultra detailed, 8k, neon cyberpunk`
      : `${prompt}, beautiful woman, cyberpunk neon, glowing makeup, cinematic, ultra detailed`;

    const res = await fetch("https://stablehorde.net/api/v2/generate/async", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: fullPrompt,
        nsfw: nsfw,
        censor_nsfw: false,
        models: ["SDXL 1.0", "Deliberate", "Anything V5"],
        params: {
          width: 768,
          height: 1024,
          steps: 30,
          cfg_scale: 7.5,
          sampler_name: "k_euler",
          n: 1,
        },
      }),
    });

    const data = await res.json();
    if (data.message) throw new Error(data.message);

    const id = data.id;

    // Ждём готовности
    let result;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 1500));
      const check = await fetch(`https://stablehorde.net/api/v2/generate/check/${id}`);
      result = await check.json();
      if (result.done) break;
    }

    const status = await fetch(`https://stablehorde.net/api/v2/generate/status/${id}`);
    const final = await status.json();

    if (!final.generations?.[0]?.img) throw new Error("No image");

    const imageUrl = final.generations[0].img;
    const imgRes = await fetch(imageUrl);

    return new Response(imgRes.body, {
      headers: { "Content-Type": "image/webp" },
    });

  } catch (e) {
    console.error("Horde Image Error:", e);
    return new Response(JSON.stringify({ error: "Generation failed" }), { status: 500 });
  }
};
