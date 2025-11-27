// app/api/tts/route.js
const VOICES = {
  nova:    "21m00Tcm4TlvDq8ikWAM", // мягкий женский (по умолчанию)
  shimmer: "EXrN9tFqE6dYg3rX227N", // сексуальный/дыхательный женский
  echo:    "pNqPqEChMhB3lW9Jj5jF", // мужской
};

export const POST = async (req) => {
  try {
    const { text, voice = "nova" } = await req.json();
    const key = process.env.ELEVENLABS_API_KEY;

    if (!key) return new Response("ElevenLabs key missing", { status: 500 });
    if (!text?.trim()) return new Response("No text", { status: 400 });

    const voiceId = VOICES[voice] || VOICES.nova;

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.slice(0, 4000),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.85,
          style: voice === "shimmer" ? 0.9 : 0.5, // больше экспрессии для NSFW
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("TTS Error:", e);
    return new Response("TTS failed", { status: 500 });
  }
};
