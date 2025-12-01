const HF_URL = "https://router.huggingface.co/v1/chat/completions";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      console.error("NO TOKEN");
      return Response.json({ reply: "Токен не найден 🤷‍♀️" });
    }

    const system = `Ты — Ника, милая подруга. Отвечай коротко и по делу.`;

    const res = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct", // ✔ поддерживается!
        messages: [
          { role: "system", content: system },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("HF ERROR:", txt);
      return Response.json({ reply: "Ой… попробуй ещё ❤️" });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content ?? "❤️";

    return Response.json({ reply });

  } catch (e) {
    console.error("Crash:", e);
    return Response.json({ reply: "Я запуталась 😵‍💫" });
  }
};
