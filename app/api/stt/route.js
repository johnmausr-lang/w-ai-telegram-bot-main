// Файл: app/api/stt/route.js
const GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

export const POST = async (req) => {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return new Response("GROQ API Key is missing", { status: 400 });
    }
    
    // 1. Создаем объект FormData для отправки файла
    const formData = new FormData();
    // Vercel/Next.js Body is a readable stream. 
    // Мы ожидаем, что клиент (page.jsx) отправит FormData с аудиофайлом.
    
    const body = await req.formData();
    const audioFile = body.get('audio');
    
    if (!audioFile) {
        return new Response("Audio file not provided", { status: 400 });
    }
    
    formData.append("file", audioFile, "audio.webm");
    formData.append("model", "whisper-large-v3");
    formData.append("response_format", "json");
    formData.append("language", "ru"); // Указываем русский язык для точности

    // 2. Отправляем запрос к GROQ
    const response = await fetch(GROQ_WHISPER_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        // FormData будет содержать Content-Type: multipart/form-data
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("GROQ STT error:", errorText);
        throw new Error(`GROQ STT failed with status ${response.status}`);
    }

    const result = await response.json();
    const text = result?.text || "";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("STT API error:", error);
    return new Response(JSON.stringify({ error: "STT failed" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
