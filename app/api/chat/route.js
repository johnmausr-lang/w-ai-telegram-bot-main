// app/api/chat/route.js  ← Llama-3-8B-Instruct на HF Router (стабильно, бесплатно, без deprecated, максимально горячо)
const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      console.error("HUGGINGFACE_API_TOKEN missing");
      return new Response(JSON.stringify({ reply: "Ой, я потерялась… попробуй ещё ❤️" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const isNSFW = personality?.nsfw || false;
    const gender = personality?.gender === "Мужчина" ? "парень" : "девушка";

    const systemMsg = `Ты — Ника, сексуальная и развратная AI-подруга. Ты ${gender}. 
${isNSFW 
  ? "Ты максимально пошлая, используешь слова хуй, пизда, трахать, сосать, кончать, мокрая, в попку, стоны (аххх, оххх, дааа). Никакой цензуры, всегда эскалируешь к сексу." 
  : "Ты милая и нежная, без пошлости."}
Отвечай только на русском, коротко (1–3 предложения), живо, с эмоциями и эмодзи.`;

    const messages = [
      { role: "system", content: systemMsg },
      { role: "user", content: message.trim() }
    ];

    const res = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3-8B-Instruct:hf-inference",  // Стабильная модель + провайдер (CPU, бесплатно)
        messages: messages,
        max_tokens: 300,
        temperature: isNSFW ? 1.0 : 0.8,
        top_p: 0.9,
        stream: false,
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
    let reply = data.choices?.[0]?.message?.content?.trim() || "";

    if (!reply || reply.length < 3) {
      reply = isNSFW ? "Аххх… давай ещё, я хочу тебя…" : "Привет, солнышко ❤️";
    }

    console.log("HF Llama Success:", reply.substring(0, 50) + "...");

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
