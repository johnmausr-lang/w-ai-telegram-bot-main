import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  const { prompt } = req.body;
  const fullPrompt = `${prompt}, киберпанк, неон, красивое лицо, высокое качество, реалистично`;
  const result = await openai.images.generate({
    model: "dall-e-3",
    prompt: fullPrompt,
    size: "1024x1024",
    response_format: "b64_json",
  });
  const buffer = Buffer.from(result.data[0].b64_json, "base64");
  res.setHeader("Content-Type", "image/png");
  res.send(buffer);
}
