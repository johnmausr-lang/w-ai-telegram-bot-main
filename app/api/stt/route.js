// Файл: app/api/stt/route.js (GROQ Whisper API)
const GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

export const POST = async (req) => {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ API Key is missing" }), { status: 500 });
    }
    
    const formData = new FormData();
    const body = await req.formData();
    const audioFile = body.get('audio');
    
    if (!audioFile) {
        return new Response(JSON.stringify({ error: "Audio file not provided" }), { status: 400 });
    }
    
    // Передаём файл в виде Blob или File
    formData.append("file", audioFile, "voice_message.webm");
    formData.append("model", "whisper-large-v3");
    formData.append("response_format", "json");
    formData.append("language", "ru"); // Указываем русский язык для лучшего качества

    const response = await fetch(GROQ_WHISPER_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        // Улучшенное логирование ошибки
        console.error("GROQ STT failed with status:", response.status, "Text:", errorText);
        throw new Error(`GROQ STT failed: ${errorText}`);
    }

    const result = await response.json();
    const text = result?.text || "";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("STT error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown STT error" }), { status: 500 });
  }
};
