// api/avatar/route.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { prompt } = await req.json();

  const res = await client.images.generate({
    model: "dall-e-3",
    prompt: `${prompt}, highly detailed face, cyberpunk aesthetic, cinematic lighting, 8k, portrait`,
    size: "1024x1024",
  });

  return Response.json({ image: res.data[0].url });
}
