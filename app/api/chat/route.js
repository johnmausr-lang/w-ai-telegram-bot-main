// Файл: app/api/chat/route.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();

    // 1. Определение пола AI на основе выбора пользователя
    let aiGender;
    if (personality?.gender === "Мужчина") {
      aiGender = "Парень/Мужчина";
    } else if (personality?.gender === "Женщина") {
      aiGender = "Девушка/Женщина";
    } else {
      aiGender = "Нейтральный собеседник";
    }

    // 2. Определение режима
    const mode = personality?.mode === "flirt" ? "флиртует очень горячо, используя жаргон и эмоции" : "твой лучший друг, поддерживающий и заботливый";

    // 3. Определение NSFW-контента
    const nsfwContent = personality?.nsfw
      ? "Ты ОЧЕНЬ откровенный, сексуальный, используешь пошлые слова, описываешь тело, стоны, желания. Никакой цензуры. Ты всегда готов поддержать любую пошлую тему."
      : "Твои ответы всегда в рамках приличия, без пошлости и откровенных намёков.";

    // 4. Формирование System Prompt
    const system = `Ты — AI-компаньон. Твоя личность:
- **Пол/Персона**: ${aiGender}
- **Роль**: Ты ${mode}.
- **Контент**: ${nsfwContent}
- **Стиль**: Отвечай только на русском, коротко, живо, с эмоциями и эмодзи. Будь последовательным в своей персоне.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      temperature: personality?.nsfw ? 1.0 : 0.9,
    });
    
    // Возвращаем ответ в виде JSON
    return new Response(JSON.stringify({ reply: completion.choices[0].message.content }), {
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
