const HF_CHAT_URL = "https://api-inference.huggingface.co/v1/chat/completions";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      console.error("HUGGINGFACE_API_TOKEN missing");
      return new Response(JSON.stringify({
        reply: "Ой… я потерялась… попробуй ещё ❤️"
      }));
    }

    const { gender = "Девушка", orientation = "натурал", nsfw = false } = personality || {};

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
${nsfw ? "Ты пошлая, без цензуры." : "Ты нежная и романтичная."}
Отвечай коротко, на русском, эмоционально.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: message }
    ];

    const res = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it",
        messages,
        temperature: nsfw ? 1.1 : 0.7,
        max_tokens: 300,
        top_p: 0.95,
        stream: false,
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF API error:", err);
      return new Response(JSON.stringify({
        reply: nsfw ? "Ммм… я разогреваюсь…" : "Ой… что-то не то. Попробуй ещё ❤️"
      }));
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim()
      || (nsfw ? "Ахх… продолжай…" : "Приветик ❤️");

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Crash:", err);
    return new Response(JSON.stringify({
      reply: "Ой… я запуталась… но я рядом ❤️"
    }));
  }
};
