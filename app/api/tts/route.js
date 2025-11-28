// app/api/tts/route.js  ← ВРЕМЕННАЯ ГЛУШКА (всегда 200, без ошибок)
export const POST = async (req) => {
  try {
    // Парсим body, но если ошибка — fallback
    let text = "";
    let gender = "Женщина"; // default
    try {
      const body = await req.json();
      text = body.text || "";
      gender = body.gender || "Женщина";
    } catch (e) {
      console.warn("TTS body parse failed:", e);
    }

    if (!text) {
      // Возвращаем пустой blob (тишина 0.5 сек)
      const emptyAudio = new Uint8Array(44); // WAV header stub
      const blob = new Blob([emptyAudio], { type: "audio/mpeg" });
      return new Response(blob, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg" },
      });
    }

    // Fallback: текст вместо аудио (для отладки)
    console.log(`TTS fallback: ${text} (gender: ${gender})`);
    return new Response(JSON.stringify({ text }), { status: 200 });

  } catch (error) {
    console.error("TTS error:", error);
    // Пустой аудио-blob
    const emptyAudio = new Uint8Array(44);
    const blob = new Blob([emptyAudio], { type: "audio/mpeg" });
    return new Response(blob, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });
  }
};
