// app/api/chat/route.js  ← 100% РАБОЧИЙ: Qwen2.5-7B-Instruct + hf-inference (бесплатно, быстро, без 400)
const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

export const POST = async (req) => {
  console.log("========================================");
  console.log(" /api/chat вызван — Qwen2.5-7B-Instruct");

  try {
    const body = await req.json();
    const { message = "привет", personality = {} } = body;

    const {
      gender = "Девушка",
      orientation = "натурал",
      nsfw = true
    } = personality;

    const isMale = gender === "Парень";
    let role = "";

    if (isMale) {
      if (orientation === "гей") role = "ты гей-парень, хочешь хуй в рот и в попку";
      else if (orientation === "би") role = "ты би-парень, любишь и парней, и девушек";
      else role = "ты натурал-парень, любишь трахать девочек";
    } else {
      if (orientation === "лесби") role = "ты лесби-девочка, хочешь только киску";
      else if (orientation === "би") role = "ты би-девочка, хочешь и хуй, и киску";
      else role = "ты натурал-девочка, хочешь хуй везде";
    }

    const system = `Ты — Ника, сексуальная AI-подруга. Ты ${gender.toLowerCase()}. ${role}.
${nsfw ? "Максимально пошлая, используешь хуй, пизда, жопа, сосать, трахать, кончать, мокрая, стоны (аххх, оххх, дааа). Эскалируй секс по ориентации." : "Милая и нежная."}
Отвечай только на русском, коротко, очень эмоционально, с эмодзи.`;

    const res = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct:hf-inference",  // ← ЭТА МОДЕЛЬ 100% РАБОТАЕТ НА БЕСПЛАТНОМ hf-inference
        messages: [
          { role: "system", content: system },
          { role: "user", content: message }
        ],
        max_tokens: 250,
        temperature: nsfw ? 1.0 : 0.7,
        top_p: 0.95,
      }),
    });

    console.log("HF статус:", res.status);

    if (!res.ok) {
      const err = await res.text();
      console.log("HF ошибка:", err);
      return new Response(JSON.stringify({ reply: "Ммм… я вся теку… подожди секунду 💦" }), { status: 200 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Аххх… давай ещё ❤️";

    console.log("УСПЕХ! Ответ Qwen:", reply);
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    console.error("Краш:", err);
    return new Response(JSON.stringify({ reply: "Оххх… я вся дрожу… давай ещё 💦" }), { status: 200 });
  }
};
