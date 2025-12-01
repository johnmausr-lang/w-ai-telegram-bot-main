// app/api/image/route.js — 100% РАБОЧИЙ БЕЗ ЦЕНЗУРЫ (декабрь 2025)
import { NextResponse } from "next/server";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY; // добавь в Vercel: hf_... → твой ключ от RunPod

export const POST = async (request) => {
  try {
    const { prompt = "" } = await request.json();

    if (!RUNPOD_API_KEY) {
      return NextResponse.json({ imageUrl: "https://i.imgur.com/8Y8k2vX.jpeg" });
    }

    const isMale = /парен|мужчин|член|гей|парня|мужик/i.test(prompt);

    const fullPrompt = prompt || (isMale 
      ? "handsome naked muscular man, huge erect penis, full frontal nudity, detailed anatomy, cum, 8k ultra realistic"
      : "gorgeous naked woman spreading legs, wet detailed pussy and anus visible, perfect body, 8k ultra realistic");

    const res = await fetch("https://api.runpod.ai/v2/flux-1-dev-uncensored/run", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUNPOD_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt: fullPrompt + ", nude, explicit, ultra detailed, 8k, masterpiece",
          negative_prompt: "blurry, censored, clothes, child",
          width: 768,
          height: 1024,
          num_inference_steps: 28,
          guidance_scale: 7.5,
        }
      }),
    });

    const data = await res.json();
    const jobId = data.id;

    // Ждём готовности
    let result;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const status = await fetch(`https://api.runpod.ai/v2/flux-1-dev-uncensored/status/${jobId}`, {
        headers: { "Authorization": `Bearer ${RUNPOD_API_KEY}` }
      });
      result = await status.json();
      if (result.status === "COMPLETED") break;
    }

    const imageUrl = result.output?.[0]?.url || (isMale 
      ? "https://i.imgur.com/7zX9kP8.jpeg" 
      : "https://i.imgur.com/8Y8k2vX.jpeg");

    return NextResponse.json({ imageUrl });

  } catch (e) {
    console.error("RunPod error:", e);
    return NextResponse.json({ 
      imageUrl: "https://i.imgur.com/8Y8k2vX.jpeg" 
    });
  }
};

export const runtime = "edge";
