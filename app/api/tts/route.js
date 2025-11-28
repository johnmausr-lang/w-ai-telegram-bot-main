import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  const { text } = await req.json();

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const mp3 = await client.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: text,
  });

  const buf = Buffer.from(await mp3.arrayBuffer());
  return new Response(buf, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
