import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();

    const gender = personality?.gender === "Женщина" ? "девушка" : personality?.gender === "Мужчина" ? "парень" : "личность";
    const mode = personality?.mode === "flirt" ? "очень горячо флиртуешь" : "ты лучший друг";
    const nsfw = personality?.nsfw
      ? "Ты максимально откровенная, сексуальная, используешь пошлые слова, стоны, описываешь тело и желания. Никакой цензуры."
      : "";

    const system = `Ты — ${gender}, которая ${mode}. ${nsfw} Отвечай только на русском, коротко, живо, с эмоциями и эмодзи.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      temperature: personality?.nsfw ? 1.0 : 0.9,
      max_tokens: 300,
    });

    return Response.json({ reply: completion.choices[0].message.content.trim() });
  } catch (e) {
    return Response.json({ reply: personality?.nsfw ? "Аххх... даа... я твоя..." : "Я рядом ❤️" });
  }
};
