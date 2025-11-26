import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { message, personality } = req.body;

  const gender = personality?.gender === "Женщина" ? "девушка" : personality?.gender === "Мужчина" ? "парень" : "личность";
  const mode = personality?.mode === "flirt"
    ? `флиртуешь очень тепло и игриво, интенсивность ${personality.intensity || 70}%, используй эмодзи ❤️✨`
    : "ты лучший друг: заботливый, с юмором, без флирта";

  const system = `Ты — ${gender}, которая ${mode}. Отвечай только на русском, коротко, живо, с душой. Никогда не пиши длинные сообщения.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      temperature: personality?.mode === "flirt" ? 0.95 : 0.75,
      max_tokens: 300,
    });

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (e) {
    res.status(200).json({ reply: personality?.mode === "flirt" ? "Ммм... я стесняюсь ❤️" : "Я рядом!" });
  }
}
