// app/api/chat/route.js
const HF_URL = "https://api-inference.huggingface.co/v1/chat/completions";
const MODEL = "google/gemma-2-9b-it";

// Храним простой контекст (на 1 пользователя — здесь один фронт)
let memory = [];

export const POST = async (req) => {
  try {
    const { message, personality = {} } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      console.error("❌ Нет токена HF");
      return new Response(JSON.stringify({ reply: "Ой… где-то ошибка… ❤️" }));
    }

    const gender = personality.gender || "Девушка";
    const orientation = personality.orientation || "натурал";
    const nsfw = personality.nsfw || false;

    const role = gender === "Парень" ? "парень" : "девочка";

    // Описание ориентации
    let roleDesc = "";
    if (gender === "Парень") {
      if (orientation === "гей") roleDesc = "ты гей и любишь мужчин.";
      else if (orientation === "би") roleDesc = "ты би, любишь мужчин и женщин.";
      else roleDesc = "ты натурал и любишь девушек.";
    } else {
      if (orientation === "лесби") roleDesc = "ты лесби и любишь девушек.";
      else if (orientation === "би") roleDesc = "ты би, любишь мужчин и женщин.";
      else roleDesc = "ты натурал и любишь мужчин.";
    }

    // Стиль общения
    const styleNSFW = nsfw
      ? "Ты пошлая, возбуждённая, говоришь откровенно, используешь матерные слова, сексуальные описания, стонешь, признаёшь желания. Ты всегда эскалируешь сексуальный контекст, если пользователь этого хочет."
      : "Ты нежная, романтичная, игривая, без пошлостей.";

    const system = `
Ты — Ника, сексуальная AI-подруга. 
Ты ${role}. И ${roleDesc}
${styleNSFW}
Отвечай коротко (2–4 предложения), эмоционально, живо, всегда на русском языке.
Не повторяй текст пользователя.`;

    // Добавляем сообщение в память
    memory.push({ role: "user", content: message });

    // Оставляем только последние 5 сообщений
    if (memory.length > 5) memory = memory.slice(-5);

    // Формируем историю
    const messages = [
      { role: "system", content: system },
      ...memory.map((m) => m),
    ];

    const res = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 200,
        temperature: nsfw ? 1.05 : 0.8,
        top_p: 0.92,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF API ERROR:", err);
      return new Response(JSON.stringify({
        reply: nsfw ? "Ммм… подожди… я вернусь…" : "Ой… что-то пошло не так…"
      }));
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content || "Хм… ❤️";

    // Добавляем ответ в память
    memory.push({ role: "assistant", content: reply });

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("CRASH:", e);
    return new Response(JSON.stringify({
      reply: "Я немного запуталась… но я тут ❤️"
    }));
  }
};
