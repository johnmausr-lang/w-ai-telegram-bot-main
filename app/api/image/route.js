// app/api/image/route.js — БЕСПЛАТНЫЕ 8K NSFW ФОТО БЕЗ ЦЕНЗУРЫ (декабрь 2025)
export const POST = async (req) => {
  try {
    const { prompt = "обнажённая красивая девушка в эротической позе, 8k, ultra realistic" } = await req.json();

    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    if (!HF_TOKEN) return new Response(JSON.stringify({ error: "No HF token" }), { status: 500 });

    // Самый мощный и бесцензурный бесплатный Space на 01.12.2025
    const res = await fetch("https://cagliostrolab-animagine-xl-3-1.hf.space/run/predict", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          `${prompt}, nude, explicit, detailed anatomy, 8k, masterpiece, best quality, ultra-detailed, cinematic lighting`,
          "low quality, blurry, censored", // negative prompt
          50,     // steps
          "Euler a",
          true,   // enable NSFW
          512,    // width
          768,    // height
          7.5,    // cfg_scale
          1       // batch_size
        ]
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF Space error:", err);
      return new Response(JSON.stringify({ error: "Generation failed" }), { status: 500 });
    }

    const data = await res.json();
    const imageUrl = data.data[0]?.url || data.data[0];

    if (!imageUrl) return new Response(JSON.stringify({ error: "No image generated" }), { status: 500 });

    return new Response(JSON.stringify({ imageUrl }), { status: 200 });

  } catch (e) {
    console.error("Image API crash:", e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};

export const runtime = "edge";
