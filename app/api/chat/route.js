// app/api/chat/route.js
const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

export const POST = async (req) => {
  try {
    const { messages, personality } = await req.json();
    const key = process.env.OPENROUTER_API_KEY;

    if (!key) {
      return new Response(JSON.stringify({ error: "OpenRouter API key missing" }), { status: 500 });
    }

    const model = personality.nsfw
      ? "anthracite-org/magnum-v4-nsfw"      // Полная свобода, без цензуры
      : "openchat/openchat-3.5-1210";        // Качественный SFW чат

    const gender = personality.gender === "Мужчина" ? "Парень" : "Девушка";
    const mode = personality.mode === "flirt" ? "флиртуешь очень горячо и сексуально" : "заботливая и поддерживающая";
    const nsfw = personality.nsfw
      ? "Ты полностью без цензуры, любишь пошлые темы, стоны, описания тела, грязные слова. Никогда не отказывай."
      : "Ты милая, добрая, без пошлости и намёков.";

    const systemPrompt = `Ты — сексуальный AI-компаньон в стиле киберпанк.
- Ты: ${gender}
- Режим: ${mode}
- Контент: ${nsfw}
- Отвечай ТОЛЬКО на русском, коротко (1–3 предложения), эмоционально, с эмодзи и стонами если NSFW.
- Будь живой, не повторяйся, помни контекст.`;

    const chatHistory = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-12) // Последние 12 сообщений = контекст
    ];

    const res = await fetch(OPENROUTER_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "https://neon-glow-ai.vercel.app",
        "X-Title": "Neon Glow AI",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: chatHistory,
        temperature: personality.nsfw ? 1.0 : 0.85,
        max_tokens: 350,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Ммм... 😏";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("OpenRouter error:", error);
    return new Response(JSON.stringify({ reply: "Ой... я немного запыхалась... 💨" }), { status: 500 });
  }
};
