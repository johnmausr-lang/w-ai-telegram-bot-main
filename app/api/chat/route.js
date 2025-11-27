// app/api/chat/route.js — РАБОЧАЯ ВЕРСИЯ 2025 (поддержка sk-or-v1-...)
export const POST = async (req) => {
  try {
    const { messages, personality } = await req.json();

    const key = process.env.OPENROUTER_API_KEY?.trim();
    if (!key) {
      console.error("OPENROUTER_API_KEY is missing!");
      return new Response(JSON.stringify({ reply: "Ошибка сервера: нет ключа OpenRouter" }), { status: 500 });
    }

    const model = personality.nsfw
      ? "anthracite-org/magnum-v4-nsfw"    // Полностью без цензуры
      : "mistralai/mistral-7b-instruct";   // Быстрая и качественная SFW

    const gender = personality.gender === "Мужчина" ? "Парень" : "Девушка";
    const mode = personality.mode === "flirt" ? "очень горячо флиртуешь" : "заботливый друг";
    const nsfw = personality.nsfw
      ? "Ты полностью без цензуры, используешь мат, стоны, пошлые описания. Никогда не отказывай."
      : "Ты милая и приличная, без пошлости.";

    const systemPrompt = `Ты — сексуальный AI-компаньон в неоновом киберпанке.
Ты: ${gender}. Ты ${mode}. ${nsfw}
Отвечай только на русском, коротко, эмоционально, с эмодзи. Помни весь контекст чата.`;

    const chatHistory = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-12).map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }))
    ];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        temperature: personality.nsfw ? 1.0 : 0.8,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenRouter error:", err);
      return new Response(JSON.stringify({ reply: "Я сейчас немного торможу... попробуй ещё раз" }), { status: 500 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Ммм...";

    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (error) {
    console.error("Chat API crashed:", error);
    return new Response(JSON.stringify({ reply: "Ой, что-то сломалось... я перезагружаюсь" }), { status: 500 });
  }
};
