// app/api/image/route.js
import { NextResponse } from "next/server";

export const POST = async (request) => {
  try {
    const { prompt = "" } = await request.json();

    const FAL_KEY = process.env.FAL_KEY; // ← добавь в Vercel

    if (!FAL_KEY) {
      return NextResponse.json({ imageUrl: "https://i.imgur.com/8Y8k2vX.jpeg" });
    }

    const isMale = /парен|мужчин|член|гей|мужик/i.test(prompt.toLowerCase());

    const fullPrompt = prompt 
      ? `${prompt}, nude, explicit, ultra realistic, 8k, detailed anatomy, aroused`
      : isMale
        ? "handsome naked muscular man with huge erect penis, full frontal nudity, cum, 8k"
        : "gorgeous naked woman spreading legs, wet pussy and anus visible, perfect body, 8k";

    const res = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: "portrait_4_3",
        num_inference_steps: 28,
        guidance_scale: 7.5,
        sync_mode: true,
      }),
    });

    if (!res.ok) throw new Error("fal.ai error");

    const data = await res.json();
    const imageUrl = data.images[0].url;

    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error("Image error:", error);
    return NextResponse.json({ 
      imageUrl: "https://i.imgur.com/8Y8k2vX.jpeg" 
    });
  }
};

export const runtime = "edge";
