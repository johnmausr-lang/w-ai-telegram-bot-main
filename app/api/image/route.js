// app/api/image/route.js
import { NextResponse } from "next/server";

export const POST = async (request) => {
  try {
    const { prompt = "" } = await request.json();
    const FAL_KEY = process.env.FAL_KEY;

    if (!FAL_KEY) {
      return NextResponse.json({ imageUrl: "https://i.imgur.com/8Y8k2vX.jpeg" });
    }

    const isMale = /парен|мужчин|член|гей|мужик|парня/i.test(prompt.toLowerCase());

    const fullPrompt = prompt
      ? `${prompt}, nude, explicit, ultra realistic, 8k, detailed anatomy, aroused, masterpiece`
      : isMale
        ? "handsome naked muscular man, huge erect penis, full frontal nudity, detailed cock, cum, ultra realistic 8k"
        : "gorgeous naked woman spreading legs wide, wet pussy and anus visible, perfect body, hard nipples, ultra realistic 8k";

    const res = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: "square_hd",
        num_inference_steps: 28,
        guidance_scale: 7.0,
        sync_mode: true,
      }),
    });

    if (!res.ok) throw new Error("fal failed");

    const data = await res.json();
    return NextResponse.json({ imageUrl: data.images[0].url });

  } catch (error) {
    return NextResponse.json({ imageUrl: "https://i.imgur.com/8Y8k2vX.jpeg" });
  }
};

export const runtime = "edge";
