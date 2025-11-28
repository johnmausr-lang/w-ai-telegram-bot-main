// Файл: app/api/tts/route.js (ElevenLabs)
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech/";
// ElevenLabs Voice ID для русского языка (мужской/женский)
const FEMALE_VOICE_ID = "EXrN9tFqE6dYg3rX227N"; 
const MALE_VOICE_ID = "pNqPqEChMhB3lW9Jj5jF"; 

export const POST = async (req) => {
  try {
    const { text, gender } = await req.json();
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    if (!text || !ELEVENLABS_API_KEY) {
      return new Response("Text or API Key is missing", { status: 400 });
    }
    
    const voiceId = gender === "Мужчина" ? MALE_VOICE_ID : FEMALE_VOICE_ID;
    
    const response = await fetch(`${ELEVENLABS_API_URL}${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text.slice(0, 5000), // Ограничение на текст
        model_id: "eleven_multilingual_v2", // Поддержка русского языка
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs failed with status ${response.status}`);
    }

    const audioBlob = await response.blob();
    return new Response(audioBlob, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response("TTS failed", { status: 500 });
  }
};
