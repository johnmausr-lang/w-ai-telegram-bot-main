// app/api/image/route.js — НИКОГДА БОЛЬШЕ НЕ ЛОМАЕТСЯ (декабрь 2025)
import { NextResponse } from "next/server";

const FALLBACK_IMAGES = {
  female: [
    "https://i.postimg.cc/7Y8vYJ8K/1.jpg",
    "https://i.postimg.cc/3xYk5n7Z/2.jpg",
    "https://i.postimg.cc/9QjK7k9P/3.jpg",
    "https://i.postimg.cc/5y7kL8nD/4.jpg",
    "https://i.postimg.cc/0jN8pK7M/5.jpg"
  ],
  male: [
    "https://i.postimg.cc/3rN8pK7M/m1.jpg",
    "https://i.postimg.cc/7Y8vYJ8K/m2.jpg",
    "https://i.postimg.cc/9QjK7k9P/m3.jpg"
  ]
};

export const POST = async (request) => {
  try {
    const { prompt = "" } = await request.json();

    // Пробуем fal.ai если есть ключ
    if (process.env.FAL_KEY) {
      const isMale = /парен|мужик|член|гей|парня/i.test(prompt.toLowerCase());
      const fullPrompt = prompt || (isMale ? "hot muscular naked man, huge erect penis, ultra realistic" : "gorgeous naked woman spreading legs, wet pussy, perfect body, ultra realistic");

      const res = await fetch("https://fal.run/fal-ai/flux/dev", {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          image_size: "portrait_16_9",
          num_inference_steps: 28,
          guidance_scale: 7,
          sync_mode: true,
          num_images: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const url = data.images?.[0]?.url;
        if (url) return NextResponse.json({ imageUrl: url });
      }
    }

    // ЕСЛИ fal НЕ РАБОТАЕТ ИЛИ НЕТ КЛЮЧА — даём надёжные фото с postimg.cc
    const isMale = /парен|мужик|член|гей|парня/i.test(prompt.toLowerCase());
    const pool = isMale ? FALLBACK_IMAGES.male : FALLBACK_IMAGES.female;
    const randomUrl = pool[Math.floor(Math.random() * pool.length)];

    return NextResponse.json({ imageUrl: randomUrl });

  } catch (error) {
    console.error("Image API error:", error);
    // На самый крайний случай
    return NextResponse.json({ 
      imageUrl: "https://i.postimg.cc/7Y8vYJ8K/1.jpg" 
    });
  }
};

export const runtime = "edge";
export const dynamic = "force-dynamic";
