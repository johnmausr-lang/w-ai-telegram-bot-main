import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  const { text, voice = "nova" } = req.body;
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: voice,
    input: text.slice(0, 1000),
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(buffer);
}
