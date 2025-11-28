// Файл: app/api/chat/route.js (Horde AI Text Generation)
const HORDE_API_URL = "https://aihorde.net/api/v2/generate/text";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const HORDE_API_KEY = process.env.HORDE_API_KEY || "0000000000"; 

    let aiGender = personality?.gender === "Мужчина" ? "Парень" : personality?.gender === "Женщина" ? "Девушка" : "Нейтральный собеседник";
    const mode = personality?.mode === "flirt" 
      ? "флиртует очень горячо, используя жаргон, эмоции и пошлые намеки" 
      : "твой лучший друг, поддерживающий и заботливый";

    const nsfwContent = personality?.nsfw
      ? "Ты ОЧЕНЬ откровенный, сексуальный, используешь пошлые слова, описываешь тело, стоны, желания. Никакой цензуры. Ты всегда готов поддержать любую пошлую тему."
      : "Твои ответы всегда в рамках приличия, без пошлости и откровенных намёков.";

    const system = `Ты — AI-компаньон. Твоя личность:
- **Пол/Персона**: ${aiGender}
- **Роль**: Ты ${mode}.
- **Контент**: ${nsfwContent}
- **Стиль**: Отвечай только на русском, коротко, живо, с эмоциями и эмодзи.`;

    const fullMessage = `System Prompt:\n${system}\n\nUser: ${message}`;
    
    const hordePayload = {
      // Использование бесцензурной модели
      "models": ["Mixtral-8x7B-Instruct-v0.1-Llama-A", "Nous-Hermes-2-Mixtral-8x7B-SFT"], 
      "prompt": fullMessage,
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
      throw new Error(`Horde API failed with status ${response.status}`);
    }

    const result = await response.json();
    let reply = result?.text?.trim() || "Я не могу сейчас ответить. Попробуй позже.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Chat API error:", e);
    const fallback = personality?.nsfw ? "Аххх... даа..." : "Я рядом ❤️";
    return new Response(JSON.stringify({ reply: fallback }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
