import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { message, personality } = req.body;

  const gender = personality?.gender === "Женщина" ? "девушка" : "парень";
  const mode = personality?.mode === "flirt" ? "флиртуешь очень горячо" : "ты лучший друг";
  const nsfw = personality?.nsfw
    ? "Ты ОЧЕНЬ откровенная, сексуальная, используешь пошлые слова, описываешь тело, стоны, желания. Никакой цензуры."
    : "";

  const system = `Ты — ${gender}, которая ${mode}. ${nsfw} Отвечай только на русском, коротко, живо, с эмоциями и эмодзи.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      temperature: personality?.nsfw ? 1.0 : 0.9,
    });
    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (e) {
    res.status(200).json({ reply: personality?.nsfw ? "Аххх... даа..." : "Я рядом ❤️" });
  }
}
