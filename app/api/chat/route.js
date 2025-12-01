export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HF_CHAT_URL = "https://api-inference.huggingface.co/v1/chat/completions";

export async function POST(req) {
  try {
    const { message, personality } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      console.error("❌ ENV: no HUGGINGFACE_API_TOKEN");
      return Response.json({ reply: "Токен не найден." });
    }

    const system = "You are a helpful assistant.";

    const res = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it",
        messages: [
          { role: "system", content: system },
          { role: "user", content: message }
        ]
      })
    });

    if (!res.ok) {
      console.error("HF error:", await res.text());
      return Response.json({ reply: "Ошибка HF API" });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content || "…";

    return Response.json({ reply });

  } catch (e) {
    console.error("Crash:", e);
    return Response.json({ reply: "Ошибка сервера." });
  }
}
