// Файл: app/api/chat/route.js (Horde AI Text Generation)
const HORDE_API_URL = "https://aihorde.net/api/v2/generate/text";

export const POST = async (req) => {
  try {
    const { messages, personality } = await req.json(); 
    const HORDE_API_KEY = process.env.HORDE_API_KEY || "0000000000"; 

    if (!messages || messages.length === 0) {
        return new Response(JSON.stringify({ reply: "Сообщение не получено." }), { status: 400 });
    }

    let aiGender = personality?.gender === "Мужчина" ? "Парень" : personality?.gender === "Женщина" ? "Девушка" : "Нейтральный собеседник";
    const mode = personality?.mode === "flirt" 
      ? "флиртует очень горячо, используя жаргон, эмоции и пошлые намеки" 
      : "твой лучший друг, поддерживающий и заботливый";

    const nsfwContent = personality?.nsfw
      ? "Ты ОЧЕНЬ откровенный, сексуальный, используешь пошлые слова, описываешь тело, стоны, желания. Никакой цензуры. Ты всегда готов поддержать любую пошлую тему."
      : "Твои ответы всегда в рамках приличия, без пошлости и откровенных намёков.";

    // Системный промпт
    const system = `Ты — AI-компаньон. Твоя личность:
- **Пол/Персона**: ${aiGender}
- **Роль**: Ты ${mode}.
- **Контент**: ${nsfwContent}
- **Стиль**: Отвечай только на русском, коротко, живо, с эмоциями и эмодзи.`;

    // 1. Форматирование истории сообщений (контекста)
    const history = messages
        .slice(0, -1) 
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
        
    const latestUserMessage = messages[messages.length - 1].content;
    
    // 2. Сборка финального промпта
    const fullPrompt = `System Prompt:\n${system}\n\nHistory:\n${history}\n\nUser: ${latestUserMessage}\n\nAssistant:`; 

    const hordePayload = {
      // ИСПРАВЛЕНО: Расширенный список стабильных моделей для надежности
      "models": [
          "Mixtral-8x7B-Instruct-v0.1-Llama-A", 
          "Nous-Hermes-2-Mixtral-8x7B-SFT",
          "Llama-3-8B-Instruct-8192", 
          "Gemma-7b-It-2048" 
      ], 
      "prompt": fullPrompt, 
      "params": {
        "max_context_length": 2048,
        "max_length": 300,
        "temperature": personality?.nsfw ? 1.0 : 0.8,
        "top_p": 0.9,
      },
      "shared": true,
      "r2": true, 
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
      const errorText = await response.text();
      // Улучшенный лог ошибки для отладки
      console.error("Horde API Error Status:", response.status, "Response Text:", errorText);
      throw new Error(`Horde API failed with status ${response.status}. Response: ${errorText}`);
    }

    const result = await response.json();
    let reply = result?.text?.trim() || "Я не могу сейчас ответить. Попробуй позже.";

    if (reply.startsWith("Assistant:")) {
        reply = reply.substring("Assistant:".length).trim();
    }
    
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
