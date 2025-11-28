// api/emotion/route.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { text } = await req.json();

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Определи основную эмоцию в тексте одним словом: happy, sad, angry, soft, calm, neutral. Только одно слово.",
      },
      { role: "user", content: text },
    ],
    max_tokens: 10,
  });

  return Response.json({ emotion: res.choices[0].message.content.trim().toLowerCase() });
}
