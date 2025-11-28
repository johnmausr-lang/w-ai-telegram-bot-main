import OpenAI from "openai";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const result = await openai.images.generate({
      model: "gpt-image-1",
      size: "512x512",
      prompt,
      response_format: "b64_json",
    });

    const imageB64 = result.data[0].b64_json;

    return new Response(
      JSON.stringify({ image: imageB64 }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("IMAGE API ERROR:", err);

    return new Response(
      JSON.stringify({ error: "Failed to generate image" }),
      { status: 500 }
    );
  }
}
