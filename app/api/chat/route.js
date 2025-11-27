// Файл: app/api/chat/route.js
const HORDE_API_URL = "https://aihorde.net/api/v2/generate/text";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const HORDE_API_KEY = process.env.HORDE_API_KEY || "0000000000"; // Fallback to anonymous key

    // 1. Определение пола AI и режима (для System Prompt)
    let aiGender;
    if (personality?.gender === "Мужчина") {
      aiGender = "Парень/Мужчина";
    } else if (personality?.gender === "Женщина") {
      aiGender = "Девушка/Женщина";
    } else {
      aiGender = "Нейтральный собеседник";
    }

    const mode = personality?.mode === "flirt" 
      ? "флиртует очень горячо, используя жаргон, эмоции и пошлые намеки" 
      : "твой лучший друг, поддерживающий и заботливый";

    // 2. Определение NSFW-контента
    const nsfwContent = personality?.nsfw
      ? "Ты ОЧЕНЬ откровенный, сексуальный, используешь пошлые слова, описываешь тело, стоны, желания. Никакой цензуры. Ты всегда готов поддержать любую пошлую тему."
      : "Твои ответы всегда в рамках приличия, без пошлости и откровенных намёков.";

    // 3. Формирование System Prompt (Инструкции для ИИ)
    const system = `Ты — AI-компаньон. Твоя личность:
- **Пол/Персона**: ${aiGender}
- **Роль**: Ты ${mode}.
- **Контент**: ${nsfwContent}
- **Стиль**: Отвечай только на русском, коротко, живо, с эмоциями и эмодзи. Будь последовательным в своей персоне.`;

    const fullMessage = `System Prompt:\n${system}\n\nUser: ${message}`;
    
    // 4. Настройка запроса к Horde
    const hordePayload = {
      // Выбираем популярную бесцензурную модель. 
      // Примечание: Модель может быть недоступна, нужно проверять актуальный список Horde.
      "models": ["Mixtral-8x7B-Instruct-v0.1-Llama-A"], 
      "prompt": fullMessage,
      "params": {
        "max_context_length": 2048,
        "max_length": 300,
        "temperature": personality?.nsfw ? 1.0 : 0.8,
        "top_p": 0.9,
        "sampler_order": [3, 0, 1, 2, 4, 5, 6, 7],
      },
      "shared": true,
      "r2": true, // Для более быстрого ответа
    };

    const response = await fetch(HORDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': HORDE_API_KEY,
      },
      body: JSON.stringify(hordePayload),
    });

    if (!response.ok) {
      throw new Error(`Horde API failed with status ${response.status}`);
    }

    const result = await response.json();
    let reply = result?.text?.trim() || "Я не могу сейчас ответить. Попробуй позже.";

    // Очистка ответа от возможного эха System Prompt
    if (reply.toLowerCase().startsWith('user:')) {
      reply = reply.substring(reply.indexOf('User:') + 5).trim();
    }

    // Возвращаем ответ в виде JSON
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Chat API error:", e);
    const fallback = personality?.gender === "Мужчина" 
        ? "Я здесь, братан"
        : personality?.nsfw ? "Ммм... я вся твоя..." : "Я рядом ❤️";

    return new Response(JSON.stringify({ reply: fallback }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
