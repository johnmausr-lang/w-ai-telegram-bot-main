export const runtime = "edge";

export async function POST(req) {
  try {
    const { prompt, personality } = await req.json();

    let style = "high quality, soft neon, cinematic lighting, beautiful face";
    let nsfwAddition = "";

    // ЛЁГКИЙ флирт, безопасный
    if (personality?.nsfw) {
      nsfwAddition = ", sensual atmosphere, close-up portrait, soft skin glow";
    }

    // Итоговый промпт
    const finalPrompt = `
Portrait, ultra quality, ${style} ${nsfwAddition}.
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
        size: "768x512",
        output_format: "base64",
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Image generation failed" }),
        { status: 500 }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ image: data?.data?.[0]?.b64_json }),
      { status: 200 }
    );
  } catch (error) {
    console.error("IMAGE ERROR:", error);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
