export const runtime = "edge";

export async function POST(req) {
  try {
    const { prompt, personality } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response("No OPENROUTER_API_KEY", { status: 500 });
    }

    const finalPrompt = `
portrait, neon glow, cinematic, high detail.
${personality?.nsfw ? "soft sensual lighting" : ""}
${prompt}
`;

    const response = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.OPENROUTER_API_KEY,
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-dev",
        prompt: finalPrompt,
        size: "512x768",
        output_format: "base64"
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("IMG ERROR:", err);
      return new Response(JSON.stringify({ error: "ImageError" }), { status: 500 });
    }

    const data = await response.json();

    return new Response(JSON.stringify({
      image: data?.data?.[0]?.b64_json || null
    }), { status: 200 });

  } catch (error) {
    console.error("IMAGE route error:", error);
    return new Response(JSON.stringify({ error: "ImageError" }), {
      status: 500,
    });
  }
}
