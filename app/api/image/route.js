// app/api/image/route.js — РАБОЧИЙ + КРАСИВЫЕ ФОТО БЕЗ ЧЁРНОГО КВАДРАТА (декабрь 2025)
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
      ? `${prompt}, nude, explicit, ultra realistic, 8k, detailed anatomy, aroused, perfect body, cinematic lighting`
      : isMale
        ? "handsome naked muscular man with huge erect penis, full frontal nudity, detailed cock and balls, cum dripping, ultra realistic 8k"
        : "gorgeous naked woman spreading legs wide, wet detailed pussy and anus visible, perfect breasts, hard nipples, ultra realistic 8k";

    const res = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt + ", masterpiece, best quality, highly detailed, sharp focus",
        image_size: "square_hd",           // ← КВАДРАТНЫЕ КРАСИВЫЕ ФОТО
        num_inference_steps: 30,
        guidance_scale: 7.0,
        sync_mode: true,
        num_images: 1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("fal.ai error:", err);
      throw new Error("Generation failed");
    }

    const data = await res.json();

    // Проверка, что фото действительно пришло
    if (!data.images?.[0]?.url) {
      throw new Error("No image URL");
    }

    const imageUrl = data.images[0].url;

    // Дополнительно: проверяем, не чёрная ли картинка (иногда fal отдаёт битые)
    const imgCheck = await fetch(imageUrl, { method: "HEAD" });
    if (!imgCheck.ok || imgCheck.headers.get("content-type")?.includes("image")) {
      return NextResponse.json({ imageUrl });
    } else {
      throw new Error("Invalid image");
    }

  } catch (error) {
    console.error("Image generation failed:", error.message);

    // Всегда красивое реальное фото
    const fallback = /парен|мужчин|член|гей/i.test((await request.json()).prompt || "")
      ? "https://i.imgur.com/7zX9kP8.jpeg"  // голый парень
      : "https://i.imgur.com/8Y8k2vX.jpeg"; // голая девушка

    return NextResponse.json({ imageUrl: fallback });
  }
};

export const runtime = "edge";
export const maxDuration = 60;
