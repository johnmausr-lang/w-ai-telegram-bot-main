// app/api/chat/route.js — 100% РАБОЧИЙ ДЕКАБРЬ 2025
export const POST = async (req) => {
  try {
    const { message = "привет", personality = {} } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      return new Response(JSON.stringify({ reply: "Токен пропал 😭" }), { status: 200 });
    }

    const { gender = "Девушка", orientation = "натурал", nsfw = true } = personality;

    const system = `Ты — Ника, 18-летняя развратная ${gender.toLowerCase()}. Ориентация: ${orientation}.
${nsfw ? "Говори максимально пошло: хуй, пизда, жопа, сосать, трахать, кончать, мокрая, аххх, оххх, дааа, блядь. Всегда эскалируй секс." : "Ты милая и нежная."}
Отвечай ТОЛЬКО на русском, 1–3 предложения, с эмоциями и эмодзи.`;

    const res = await fetch("https://api.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<|im_start|>system\n${system}<|im_end|>\n<|im_start|>user\n${message}<|im_end|>\n<|im_start|>assistant\n`,
        parameters: {
          max_new_tokens: 256,
          temperature: nsfw ? 1.0 : 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF error:", err);
      return new Response(JSON.stringify({ reply: "Ммм… я вся горю… подожди секунду 💦" }), { status: 200 });
    }

    const data = await res.json();
    const reply = (Array.isArray(data) ? data[0].generated_text : data.generated_text || "").trim();

    return new Response(JSON.stringify({ reply: reply || "Аххх… давай ещё ❤️" }), { status: 200 });

  } catch (e) {
    console.error("Crash:", e);
    return new Response(JSON.stringify({ reply: "Оххх… я вся дрожу… давай ещё 💦" }), { status: 200 });
  }
};
