export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HF_CHAT_URL = "https://api-inference.huggingface.co/v1/chat/completions";

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, personality = {} } = body;

    const token = process.env.HUGGINGFACE_API_TOKEN;
    if (!token) {
      console.error("❌ Missing HUGGINGFACE_API_TOKEN");
      return Response.json({ reply: "Токен не найден на сервере." });
    }

    const {
      gender = "Девушка",
      orientation = "натурал",
      nsfw = false,
    } = personality;

    // Personality generation
    let roleDesc = "";
    const isMale = gender === "Парень";

    if (isMale) {
      if (orientation === "гей") roleDesc = "ты гей-парень, любишь мужчин.";
      else if (orientation === "би") roleDesc = "ты би-парень.";
      else roleDesc = "ты натурал-парень.";
    } else {
      if (orientation === "лесби") roleDesc = "ты лесби-девочка.";
      else if (orientation === "би") roleDesc = "ты би-девочка.";
      else roleDesc = "ты натурал-девочка.";
    }

    const system = `Ты — Ника. ${roleDesc}
${nsfw ? "Ты пошлая и говоришь откровенно." : "Ты нежная и романтичная."}
Отвечай коротко, на русском, эмоционально.`;

    // Compose messages
    const messages = [
      { role: "system", content: system },
      { role: "user", content: message }
    ];

    // Request to HuggingFace Chat Completion API
    const response = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it",
        messages,
        max_tokens: 300,
        temperature: nsfw ? 1.0 : 0.7,
        top_p: 0.95
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ HF API Error:", errText);
      return Response.json({
        reply: nsfw ? "Ммм… подожди секундочку…" : "Я задумалась…"
      });
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      (nsfw ? "Ахх… продолжай…" : "Привет ❤️");

    return Response.json({ reply });

  } catch (error) {
    console.error("❌ Server crash:", error);
    return Response.json({
      reply: "Ой… я запуталась… но я рядом ❤️"
    });
  }
}
