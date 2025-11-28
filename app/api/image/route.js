import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  const { prompt } = await req.json();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const img = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "512x512",
  });

  return new Response(
    JSON.stringify({ image: img.data[0].b64_json }),
    { headers: { "Content-Type": "application/json" } }
  );
}
