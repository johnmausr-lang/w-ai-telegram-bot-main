import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  const { text } = await req.json();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const tts = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "nova",
    input: text,
  });

  const buffer = Buffer.from(await tts.arrayBuffer());

  return new Response(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length,
    },
  });
}
