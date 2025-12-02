// app/api/image/route.js
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const { prompt = "" } = await req.json();
    const FAL_KEY = process.env.FAL_KEY;

    if (!FAL_KEY) {
      return NextResponse.json({
        imageUrl: "https://i.redd.it/9vz2q2v9o0xd1.jpeg"
      });
    }

    const isGay = /парен|мужчин|член|гей|мужик|парня|хуй|пенис/i.test(prompt.toLowerCase());

    const basePrompt = prompt || (isGay
      ? "handsome naked athletic man, huge erect penis, detailed anatomy, cum, full frontal nudity, ultra realistic 8k"
      : "stunning naked woman spreading legs, wet detailed pussy and anus, perfect body, hard nipples, ultra realistic 8k");

    const res = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: basePrompt + ", masterpiece, highly detailed, sharp focus, cinematic lighting",
        image_size: "square_hd",
        num_inference_steps: 28,
        guidance_scale: 6.5,
        sync_mode: true,
        num_images: 1,
      }),
    });

    if (!res.ok) throw new Error("fal failed");

    const data = await res.json();
    const url = data.images?.[0]?.url;

    if (!url) throw new Error("no image url");

    return NextResponse.json({ imageUrl: url });

  } catch (e) {
    console.error("Image gen error:", e);
    return NextResponse.json({
      imageUrl: "https://i.redd.it/9vz2q2v9o0xd1.jpeg"
    });
  }
};

export const runtime = "edge";
