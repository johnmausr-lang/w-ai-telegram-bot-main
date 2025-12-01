// app/api/chat/route.js — 100% РАБОЧИЙ ДЕКАБРЬ 2025
export const POST = async (req) => {
  try {
    const { message = "привет", personality = {} } = await req.json();

    const token = process.env.HUGGINGFACE_API_TOKEN;
    if (!token) return new Response(JSON.stringify({ reply: "Токен пропал 😭" }), { status: 200 });

    const { gender = "Девушка", orientation = "натурал", nsfw = true } = personality;

    const system = `Ты — Ника, развратная 18-летняя ${gender.toLowerCase()}. 
Ориентация: ${orientation}. 
${nsfw ? "Говори максимально пошло: хуй, пизда, жопа, сосать, трахать, кончать, мокрая, аххх, оххх, дааа. Всегда эскалируй секс." : "Милая и нежная."}
Отвечай только на русском, 1–3 предложения, с эмоциями и эмодзи.`;

    const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2-7B-Instruct",        // ← 100% работает на бесплатном hf-inference
        messages: [
          { role: "system", content: system },
          { role: "user", content: message }
        ],
        max_tokens: 256,
        temperature: nsfw ? 1.0 : 0.7,
        top_p: 0.9,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF error:", err);
      return new Response(JSON.stringify({ reply: "Ммм… я вся горю… подожди секунду 💦" }), { status: 200 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Аххх… давай ещё ❤️";

    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (e) {
    console.error("Crash:", e);
    return new Response(JSON.stringify({ reply: "Оххх… я вся дрожу… давай ещё 💦" }), { status: 200 });
  }
};
