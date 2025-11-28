import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("file");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const transcript = await client.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
  });

  return Response.json({ text: transcript.text });
}
