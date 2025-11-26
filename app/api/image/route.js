import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const POST = async (req) => {
  const { prompt, nsfw = false } = await req.json();
  const fullPrompt = nsfw
    ? `${prompt}, обнажённая, эротическая поза, высокое качество, реалистично, красивое тело, неон, 18+`
    : `${prompt}, красивое лицо, неон, киберпанк, высокое качество`;

  const result = await openai.images.generate({
    model: "dall-e-3",
    prompt: fullPrompt,
    size: "1024x1024",
    response_format: "b64_json",
  });

  const buffer = Buffer.from(result.data[0].b64_json, "base64");
  return new Response(buffer, {
    headers: { "Content-Type": "image/png" },
  });
};
