// Файл: app/api/tts/route.js
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech/";
const DEFAULT_VOICE_ID = "XI-N2B43kGzVnI6z8eS6T"; // Замени на свой Voice ID (например, для русского языка)

export const POST = async (req) => {
  try {
    const { text, voiceId = DEFAULT_VOICE_ID } = await req.json();
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    if (!text || !ELEVENLABS_API_KEY) {
      return new Response("Text or API Key is missing", { status: 400 });
    }
    
    const safeText = text.slice(0, 5000); 

    const response = await fetch(`${ELEVENLABS_API_URL}${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: safeText,
        model_id: "eleven_multilingual_v2", // Поддержка русского языка
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", errorText);
      throw new Error(`ElevenLabs failed with status ${response.status}`);
    }

    // Возвращаем аудиофайл напрямую (Response с Blob)
    const audioBlob = await response.blob();

    return new Response(audioBlob, {
      headers: { 
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store, no-cache",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response("TTS failed", { status: 500 });
  }
};
