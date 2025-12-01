// app/api/chat/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HF_API_URL = "https://router.huggingface.co/hf-inference";

export async function POST(req) {
  try {
    const { message, personality } = await req.json();

    const token = process.env.HUGGINGFACE_API_TOKEN;
    if (!token) {
      console.error("❌ HUGGINGFACE_API_TOKEN missing");
      return Response.json({
        reply: "Ой, на сервере нет ключа… скажи хозяину меня починить ❤️"
      });
    }

    const {
      gender = "Девушка",
      orientation = "натурал",
      nsfw = false,
    } = personality || {};

    const isMale = gender === "Парень";
    let roleDesc = "";

    if (isMale) {
      if (orientation === "гей") roleDesc = "ты гей-парень, любишь мужчин.";
      else if (orientation === "би") roleDesc = "ты би-парень, любишь и мужчин, и женщин.";
      else roleDesc = "ты натурал-парень, любишь девушек.";
    } else {
      if (orientation === "лесби") roleDesc = "ты лесби-девочка, любишь девушек.";
      else if (orientation === "би") roleDesc = "ты би-девочка, любишь и мужчин, и женщин.";
      else roleDesc = "ты натурал-девочка, любишь мужчин.";
    }

    const system = `Ты — Ника, сексуальная AI-подруга. Ты ${gender.toLowerCase()}. ${roleDesc}
${nsfw ? "Ты пошлая и откровенная, без цензуры." : "Ты нежная и романтичная, без грубой пошлости."}
Отвечай только на русском, коротко (1–3 предложения), живо и с эмоциями.`;

    const prompt =
      `<|system|>\n${system}<|end|>\n` +
      `<|user|>\n${message}\n<|end|>\n` +
      `<|assistant|>`;

    const hfRes = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "HuggingFaceH4/zephyr-7b-beta",
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: nsfw ? 1.0 : 0.8,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false,
        },
        options: { wait_for_model: true },
      }),
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error("❌ HF Router error:", hfRes.status, errText);
      return Response.json({
        reply: nsfw
          ? "Ммм… я вся теку… подожди секундочку…"
          : "Ой… я немного задумалась… попробуем ещё раз?"
      });
    }

    const data = await hfRes.json();

    let reply =
      (Array.isArray(data) ? data[0]?.generated_text : data?.generated_text) ||
      "";

    // Чистим спецтеги
    reply = reply
      .replace(/<\|.*?\|>/g, "")
      .trim();

    if (!reply) {
      reply = nsfw
        ? "Ахх… продолжай, мне безумно нравится…"
        : "Привет, солнышко ❤️";
    }

    return Response.json({ reply });
  } catch (err) {
    console.error("❌ Chat crash:", err);
    return Response.json({
      reply: "Ох… у меня тут сбой… обними меня и попробуй ещё раз ❤️"
    });
  }
}
