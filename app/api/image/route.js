// app/api/image/route.js — РАБОТАЕТ С VERCEL ENV

import { NextResponse } from "next/server";

export async function POST(request) {
  const { prompt } = await request.json();

  // Ключ берётся из переменных окружения Vercel
  const FAL_KEY = process.env.FAL_KEY;

  if (!FAL_KEY) {
    return NextResponse.json({ error: "FAL_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt + ", ultra realistic, 8k, beautiful, nsfw allowed",
        image_size: "portrait_16_9",
      }),
    });

    const data = await res.json();
    const imageUrl = data.images[0].url;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image gen error:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
