import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { message, personality } = await req.json();

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `
Ты — дружелюбный AI-компаньон.
Пол: ${personality.gender}
Стиль: ${personality.mode}
Отвечай тепло, живо, эмоционально, но без NSFW.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    return Response.json({ reply: response.choices[0].message.content });
  } catch (e) {
    return Response.json({ reply: "Ошибка соединения…" });
  }
}
