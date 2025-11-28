import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  const { prompt } = await req.json();

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const img = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "512x512",
    response_format: "b64_json",
  });

  return Response.json({ image: img.data[0].b64_json });
}
