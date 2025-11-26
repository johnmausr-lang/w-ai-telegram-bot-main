import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { prompt } = req.body;
  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt + ", киберпанк, неон, красиво, высокое качество",
    size: "1024x1024",
    response_format: "b64_json",
  });
  res.setHeader("Content-Type", "image/png");
  res.send(Buffer.from(image.data[0].b64_json, "base64"));
}
