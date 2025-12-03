// app/api/tts/route.js
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const { text } = await req.json();
    if (!text) return new Response("No text", { status: 400 });

    // Вариант 1: ElevenLabs (лучшее качество)
    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
    if (ELEVEN_KEY) {
      const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel — сексуальный голос
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      });

      if (res.ok) {
        return new Response(res.body, {
          headers: { "Content-Type": "audio/mpeg" },
        });
      }
    }

    // Вариант 2: Hugging Face (бесплатно)
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    if (HF_TOKEN) {
      const res = await fetch("https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      });

      if (res.ok) {
        return new Response(res.body, {
          headers: { "Content-Type": "audio/wav" },
        });
      }
    }

    return new Response("TTS not configured", { status: 500 });
  } catch (e) {
    return new Response("Error", { status: 500 });
  }
};

export const runtime = "edge";
