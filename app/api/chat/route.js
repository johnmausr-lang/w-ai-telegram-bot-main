import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();

    const systemPrompt = personality.nsfw
      ? `Ты — сексуальная девушка 18+, максимально откровенная, используешь пошлые слова, стоны, описываешь тело. Отвечай только на русском, коротко, с эмоциями и эмодзи.`
      : `Ты — милая девушка, флиртуешь легко и нежно. Отвечай только на русском, с эмоциями и эмодзи.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: personality.nsfw ? 1.0 : 0.8,
      max_tokens: 300,
    });

    return Response.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json({ reply: personality?.nsfw ? "Ммм... даа... я твоя..." : "Я рядом" });
  }
};
