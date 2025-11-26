// api/chat.js
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { message, personality } = req.body;

  const genderPrompt =
    personality.gender === "Женщина"
      ? "Ты — красивая, нежная и уверенная в себе девушка."
      : personality.gender === "Мужчина"
      ? "Ты — харизматичный, заботливый и уверенный парень."
      : "Ты — загадочная, умная и нейтральная личность.";

  const modePrompt =
    personality.mode === "flirt"
      ? `Ты общаешься в романтическом и флиртующем стиле. Используй лёгкие комплименты, дразнилки, эмодзи. Интенсивность флирта: ${personality.intensity}%.`
      : "Ты общаешься как лучший друг: тепло, с юмором, поддержкой, без флирта.";

  const systemPrompt = `${genderPrompt} ${modePrompt} Отвечай на русском, коротко, живо и эмоционально.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: personality.mode === "flirt" ? 0.9 : 0.7,
    });

    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ reply: "Я немного застеснялась... попробуй ещё раз ❤️" });
  }
}
