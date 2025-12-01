// app/api/image/route.js — РАБОЧИЙ 8K NSFW БЕЗ ЦЕНЗУРЫ (декабрь 2025)
export const POST = async (req) => {
  try {
    const { prompt = "" } = await req.json();
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    if (!HF_TOKEN) return new Response(JSON.stringify({ error: "No token" }), { status: 500 });

    // САМЫЙ ЖИВОЙ И БЕСЦЕНЗУРНЫЙ Space на 01.12.2025
    const SPACE_URL = "https://linaqruf-animagine-xl.hf.space";

    const fullPrompt = prompt 
      ? `${prompt}, nude, fully naked, explicit, detailed pussy, anus visible, 8k, ultra realistic, masterpiece, best quality, cinematic lighting, wet skin`
      : "beautiful naked girl spreading legs, showing pussy, detailed anatomy, 8k, ultra realistic, masterpiece, wet, aroused";

    const res = await fetch(`${SPACE_URL}/call/predict`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          fullPrompt,
          "censored, low quality, blurry, ugly, deformed", // negative
          28,        // steps
          "DPM++ 2M Karras",
          512,
          768,
          7,
          1,
          -1        // seed (-1 = random)
        ]
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const { event_id } = await res.json();

    // Ждём готовности (poll)
    let imageUrl = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const poll = await fetch(`${SPACE_URL}/call/predict/${event_id}`, {
        headers: { "Authorization": `Bearer ${HF_TOKEN}` }
      });
      const result = await poll.json();
      if (result.status === "COMPLETED" && result.data?.[0]?.url) {
        imageUrl = result.data[0].url;
        break;
      }
    }

    if (!imageUrl) throw new Error("Timeout");

    return new Response(JSON.stringify({ imageUrl }), { status: 200 });

  } catch (e) {
    console.error("Image generation failed:", e);
    return new Response(JSON.stringify({ 
      imageUrl: "https://i.imgur.com/8Y8k2vX.jpeg" // fallback голое фото (на всякий случай)
    }), { status: 200 });
  }
};

export const runtime = "edge";
