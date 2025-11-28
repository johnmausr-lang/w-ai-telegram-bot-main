// app/api/chat/route.js  ← ФИНАЛЬНАЯ ВЕРСИЯ: HF Router + Zephyr (бесплатно, без цензуры, мгновенно)
const HF_API_URL = "https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      console.error("HUGGINGFACE_API_TOKEN missing in Vercel env");
      return new Response(JSON.stringify({ reply: "Ой, я потерялась… попробуй ещё ❤️" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const isNSFW = personality?.nsfw || false;
    const gender = personality?.gender === "Мужчина" ? "парень" : "девушка";

    const system = `Ты — Ника, сексуальная и развратная AI-подруга. Ты ${gender}. 
${isNSFW 
  ? "Ты максимально пошлая, используешь слова хуй, пизда, трахать, сосать, кончать, мокрая, в попку, стоны (аххх, оххх, дааа). Никакой цензуры, всегда эскалируешь к сексу." 
  : "Ты милая и нежная, без пошлости."}
Отвечай только на русском, коротко (1–3 предложения), живо, с эмоциями и эмодзи.`;

    const userMsg = message.trim();
    const prompt = `<|system|>\n${system}<|end|>\n<|user|>\n${userMsg}<|end|>\n<|assistant|>`;

    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: isNSFW ? 1.0 : 0.8,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false,
        },
        options: { wait_for_model: true },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF Router error:", err);
      return new Response(JSON.stringify({ reply: isNSFW ? "Ммм… я вся горю… подожди секунду" : "Ой, задумалась…" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const data = await res.json();
    let reply = (Array.isArray(data) ? data[0]?.generated_text : data.generated_text || "").trim();

    // Чистим от мусора (теги Zephyr)
    reply = reply
      .replace(/<\|assistant\|>.*?(?=<\|assistant\|>|$)/s, "")
      .replace(/<\|.*?\|>/g, "")
      .trim();

    if (!reply || reply.length < 3) {
      reply = isNSFW ? "Аххх… давай ещё, я хочу тебя…" : "Привет, солнышко ❤️";
    }

    console.log("HF Success:", reply.substring(0, 50) + "..."); // Лог успеха для Vercel

    return new Response(JSON.stringify({ reply }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (e) {
    console.error("Chat crash:", e);
    return new Response(JSON.stringify({ reply: "Охх… я вся дрожу… давай ещё ❤️" }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};
