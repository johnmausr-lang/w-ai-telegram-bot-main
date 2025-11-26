import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const POST = async (req) => {
  const { text, voice = "nova" } = await req.json();
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice,
    input: text.slice(0, 1000),
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  return new Response(buffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
};
