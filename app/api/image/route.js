// app/api/image/route.js — ПОЛНОСТЬЮ РАБОЧИЙ

import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "Prompt is empty" }, { status: 400 });
    }

    const FAL_KEY = process.env.FAL_KEY;
    if (!FAL_KEY) {
      console.error("FAL_KEY not found in environment");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const response = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${prompt}, beautiful woman, ultra realistic, high quality, nsfw allowed`,
        image_size: "portrait_16_9",
        num_inference_steps: 28,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("FAL API error:", error);
      throw new Error("FAL API failed");
    }

    const data = await response.json();
    const imageUrl = data.images?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL returned");
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image generation failed:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
};
