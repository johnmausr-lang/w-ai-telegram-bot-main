// app/api/chat/route.js — стабильный OpenRouter + персонаж + уровень близости
import { kv } from "@vercel/kv";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const headersJson = {
  "Content-Type": "application/json; charset=utf-8",
};

function getUserId(req) {
  return req.headers.get("x-user-id") || "anon";
}

// Простейший relationship engine
function evaluateRelationshipLevel(lastUserMessage = "", currentLevel = 0) {
  let level = currentLevel || 0;

  const text = (lastUserMessage || "").toLowerCase();

  if (text.includes("скуч") || text.includes("miss") || text.includes("думал о тебе")) {
    level += 1;
  }
  if (text.includes("игра") || text.includes("дразни") || text.includes("провоцируешь")) {
    level += 1;
  }
  if (text.includes("оставь") || text.includes("не хочу") || text.includes("заткнись")) {
    level -= 1;
  }

  if (level < 0) level = 0;
  if (level > 4) level = 4;

  return level;
}

const RELATIONSHIP_LEVELS = [
  { id: 0, name: "Незнакомцы", tone: "дружелюбный, нейтральный" },
  { id: 1, name: "Привлечение", tone: "лёгкий флирт, мягкая игра" },
  { id: 2, name: "Искра", tone: "заметный флирт, игривость, намёки" },
  { id: 3, name: "Химия", tone: "глубокие эмоции, романтика, доверие" },
  { id: 4, name: "Интимная связь", tone: "очень тёплый, чувственный, романтично-напряжённый" },
];

export const POST = async (req) => {
  try {
    const userId = getUserId(req);
    const { messages, personality } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ reply: "Пока не о чем отвечать." }),
        { status: 400, headers: headersJson }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ reply: "Сервер не настроен: нет OPENROUTER_API_KEY." }),
        { status: 500, headers: headersJson }
      );
    }

    // Загружаем сохранённый персонаж
    const savedPersona = (await kv.get(`persona:${userId}`)) || {};
    const persona = {
      ...savedPersona,
      ...personality, // фронт может переопределять поля
    };

    const lastUserMessage =
      messages
        .slice()
        .reverse()
        .find((m) => m.role === "user")?.content || "";

    // Relationship
    const prevLevel = (await kv.get(`rel:${userId}`)) ?? 0;
    const newLevel = evaluateRelationshipLevel(lastUserMessage, prevLevel);
    await kv.set(`rel:${userId}`, newLevel);

    const relMeta = RELATIONSHIP_LEVELS[newLevel];

    const gen = persona.gender || "female";
    const orientation = persona.orientation || "bi";
    const archetype = persona.archetypeName || "игривая цифровая спутница";
    const look = persona.lookDescription || persona.look || "привлекательный, слегка неоновый образ";
    const mode = persona.mode || "flirt";

    const styleMode =
      mode === "flirt"
        ? "флиртует, играет словами, даёт смелые, но не грубые намёки, создаёт мягкое напряжение"
        : "ведёт себя как тёплый, поддерживающий друг, иногда с лёгким флиртом";

    const systemPrompt = `
Ты — персональный ИИ-компаньон в стиле неонового чата для взрослых (но без грубых описаний).
Персона:
- Архетип: ${archetype}
- Гендер персонажа: ${gen}
- Ориентация: ${orientation}
- Внешность/образ: ${look}
- Стиль общения: ${styleMode}
- Текущий уровень отношений: ${relMeta.name} (${relMeta.tone})

Правила:
- Отвечай естественно, живо, эмоционально.
- Можно флиртовать, дразнить, использовать чувственные намёки.
- НЕЛЬЗЯ описывать графические сексуальные сцены, гениталии, прямые половые акты.
- Используй эмоции, атмосферу, игру, диалог, а не физиологию.
- Ответ должен ощущаться персональным, а не шаблонным.
`;

    const openRouterBody = {
      model: "mistral/mistral-7b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    };

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://your-neon-app.example",
        "X-Title": "Neon Glow AI",
      },
      body: JSON.stringify(openRouterBody),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("OpenRouter error:", res.status, text);
      return new Response(
        JSON.stringify({ reply: "Сервер сейчас молчит, попробуй ещё раз." }),
        { status: 500, headers: headersJson }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "…я немного растерялась, скажи ещё что-нибудь.";

    return new Response(
      JSON.stringify({ reply, relationshipLevel: newLevel }),
      { status: 200, headers: headersJson }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ reply: "Что-то пошло не так на сервере." }),
      { status: 500, headers: headersJson }
    );
  }
};
