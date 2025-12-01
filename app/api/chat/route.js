// app/api/chat/route.js  ← HF Router v1 + Gemma-2-9B-It (официальный URL 2025, бесплатно, без 404, роли/ориентации)
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

    const {
      gender = "Девушка",
      orientation = "натурал",
      nsfw = false
    } = personality || {};

    const isMale = gender === "Парень";

    let roleDesc = "";
    if (isMale) {
      if (orientation === "гей") roleDesc = "ты гей-парень, любишь мужчин, хочешь хуй в попку и в рот";
      else if (orientation === "би") roleDesc = "ты бисексуальный парень, любишь и парней, и девушек, хочешь и давать, и брать";
      else roleDesc = "ты натурал-парень, любишь девушек, хочешь трахать киску и попку";
    } else {
      if (orientation === "лесби") roleDesc = "ты лесби-девочка, любишь только девушек, хочешь лизать и быть вылизанной";
      else if (orientation === "би") roleDesc = "ты бисексуальная девочка, любишь и парней, и девушек, хочешь и хуй, и киску";
      else roleDesc = "ты натурал-девочка, любишь парней, хочешь хуй везде";
    }

    const systemMsg = `Ты — Ника, сексуальная и развратная AI-подруга. Ты ${gender.toLowerCase()}. ${roleDesc}.
${nsfw 
  ? "Ты максимально пошлая, используешь слова хуй, пизда, жопа, трахать, сосать, кончать, сперма, мокрая, течка, стоны (аххх, оххх, дааа, бери меня). Всегда эскалируешь к сексу в зависимости от ориентации." 
  : "Ты милая и нежная, без пошлости."}
Отвечай только на русском, коротко (1–3 предложения), очень эмоционально, с эмодзи.`;

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
        model: "google/gemma-2-9b-it:hf-inference",  // Стабильная модель 2025 + free CPU-провайдер
        messages: messages,
        max_tokens: 300,
        temperature: nsfw ? 1.0 : 0.7,
        top_p: 0.95,
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF Router error:", err);
      return new Response(JSON.stringify({ reply: nsfw ? "Ммм… я вся теку… подожди секунду" : "Ой, задумалась…" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const data = await res.json();
    let reply = data.choices?.[0]?.message?.content?.trim() || "";

    if (!reply || reply.length < 3) {
      reply = nsfw ? "Аххх… хочу тебя прямо сейчас… 💦" : "Приветик ❤️";
    }

    console.log("HF Gemma Success:", reply.substring(0, 60) + "...");

    return new Response(JSON.stringify({ reply }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (e) {
    console.error("Chat crash:", e);
    return new Response(JSON.stringify({ reply: "Оххх… я вся дрожу… давай ещё ❤️" }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};
