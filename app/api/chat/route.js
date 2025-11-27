// === Файл: app/api/chat/route.js ===
// Полностью исправленный, стабильный, совместимый с твоим frontend

export const runtime = "edge";

export async function POST(req) {
  try {
    const { message, personality } = await req.json();

    // Пол персонажа
    const aiGender =
      personality?.gender === "Мужчина"
        ? "мужчина"
        : personality?.gender === "Женщина"
        ? "женщина"
        : "андрогинный собеседник";

    // Режим
    const role =
      personality?.mode === "flirt"
        ? "флиртует мягко, живо, естественно, без повторов и шаблонов"
        : "общается дружелюбно, тепло, поддерживающе";

    // NSFW
    const nsfwBlock = personality?.nsfw
      ? `
Ты можешь использовать провокационный флирт, эмоциональные фразы, личные реакции, чувственные описания.
НЕ используй прямые описания сексуальных действий.
НЕ используй неприемлемые фразы.
Пиши только в стиле живого человека.
`
      : `
Избегай всего откровенного. Просто будь тёплым, человечным собеседником.
`;

    // Финальный system prompt
    const systemPrompt = `
Ты — персональный AI-компаньон.
Пол: ${aiGender}
Поведение: ${role}

Правила:
- Отвечай естественно, как живой человек.
- Не используй шаблоны и повторения.
- Пиши на чистом русском языке.
- Не говори «как ИИ», «как модель».
- Поддерживай стиль выбраный пользователем.
${nsfwBlock}
`;

    // --- ВЫЗОВ OPENROUTER (стабильная бесплатная модель) ---
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.OPENROUTER_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001", // стабильная, быстрая
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 200,
        temperature: personality?.nsfw ? 0.95 : 0.75,
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter error:", response.status);
      return new Response(JSON.stringify({ reply: "Я рядом… но что-то пошло не так ❤️" }), { status: 200 });
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Я здесь… просто задумалась чуть-чуть ✨";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("CHAT ROUTE ERROR:", error);

    return new Response(JSON.stringify({
      reply: personality?.nsfw ? "Ммм… подойди ближе…" : "Я рядом ❤️",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
