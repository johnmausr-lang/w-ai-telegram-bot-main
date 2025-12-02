// app/api/image/route.js — ИСПРАВЛЕННАЯ ГЕНЕРАЦИЯ ФОТО (бесплатно, без цензуры, декабрь 2025)
import { NextResponse } from "next/server";

export async function POST(req) {
  console.log("Image API вызван");

  try {
    const { prompt = "" } = await req.json();
    console.log("Промпт:", prompt || "(по умолчанию)");

    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    if (!HF_TOKEN) {
      console.error("Нет HF_TOKEN");
      return NextResponse.json({ imageUrl: "https://i.imgur.com/8Y8k2vX.jpeg" });
    }

    const isMale = /парен|мужчин|член|гей|мужик/i.test(prompt.toLowerCase());

    const fullPrompt = prompt 
      ? `${prompt}, nude, explicit, 8k, ultra realistic, detailed anatomy, aroused, masterpiece`
      : isMale
        ? "handsome naked muscular man with huge erect penis, full frontal nudity, detailed cock and balls, cum dripping, ultra realistic 8k"
        : "gorgeous naked woman spreading legs wide, wet detailed pussy and anus visible, perfect body, hard nipples, ultra realistic 8k";

    console.log("Full prompt:", fullPrompt);

    const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          negative_prompt: "blurry, low quality, censored, clothes, child, deformed, ugly",
          num_inference_steps: 28,
          guidance_scale: 7.5,
          height: 1024,
          width: 768,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF error:", err);
      throw new Error("HF failed");
    }

    const blob = await res.blob();
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log("Фото сгенерировано:", imageUrl.substring(0, 50) + "...");
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error("Image error:", error.message);

    // Fallback — всегда реальное фото
    const fallback = /парен|мужчин|член|гей/i.test(prompt.toLowerCase())
      ? "https://i.imgur.com/7zX9kP8.jpeg"  // голый парень
      : "https://i.imgur.com/8Y8k2vX.jpeg"; // голая девушка

    console.log("Использован fallback:", fallback);
    return NextResponse.json({ imageUrl: fallback });
  }
};

export const runtime = "edge";
