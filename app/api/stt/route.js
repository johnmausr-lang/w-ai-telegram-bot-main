import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("file");

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const transcript = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-tts",
  });

  return new Response(
    JSON.stringify({ text: transcript.text }),
    { headers: { "Content-Type": "application/json" } }
  );
}
