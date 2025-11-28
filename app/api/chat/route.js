import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  const { message, personality } = await req.json();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
Ты — персональный AI-компаньон.
Стиль: ${personality.mode}
Пол: ${personality.gender}
Тема: ${personality.theme}
Отвечай естественно, живо, эмоционально.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: message },
    ],
  });

  return new Response(
    JSON.stringify({ reply: completion.choices[0].message.content }),
    { headers: { "Content-Type": "application/json" } }
  );
}
