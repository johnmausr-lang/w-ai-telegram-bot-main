// app/api/chat/route.js  ← ЧИСТЫЙ ТЕСТ: только логи + один запрос к HF
export const POST = async (req) => {
  console.log("========================================");
  console.log(" /api/chat ВЫЗВАН");
  console.log("Токен в env:", !!process.env.HUGGINGFACE_API_TOKEN ? "ЕСТЬ" : "НЕТ");
  console.log("Токен (первые 10 символов):", process.env.HUGGINGFACE_API_TOKEN?.slice(0,10) || "ПУСТО");

  try {
    const body = await req.json();
    console.log("Получен body:", body);

    const { message = "привет", personality = {} } = body;
    console.log("message:", message);
    console.log("personality:", personality);

    // Жёстко фиксированный запрос — только чтобы проверить, работает ли HF вообще
    const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:hf-inference",
        messages: [
          { role: "system", content: "Ты пошлый бот. Отвечай коротко и грязно на русском." },
          { role: "user", content: message }
        ],
        max_tokens: 100,
        temperature: 1.0,
      }),
    });

    console.log("Статус ответа от HF:", res.status);
    const text = await res.text();
    console.log("Тело ответа от HF (полностью):", text.substring(0, 1000));

    if (!res.ok) {
      return new Response(JSON.stringify({ reply: `Ошибка HF ${res.status}: ${text}` }), { status: 200 });
    }

    const data = JSON.parse(text);
    const reply = data.choices?.[0]?.message?.content?.trim() || "пусто";

    console.log("УСПЕХ! Ответ модели:", reply);
    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (err) {
    console.error("Краш в /api/chat:", err);
    return new Response(JSON.stringify({ reply: `Краш: ${err.message}` }), { status: 200 });
  }
};
