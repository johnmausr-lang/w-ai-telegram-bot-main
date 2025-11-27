export const runtime = "edge";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audio = formData.get("file");

    if (!audio) {
      return new Response("Audio file missing", { status: 400 });
    }

    const buffer = await audio.arrayBuffer();

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: (() => {
        const fd = new FormData();
        fd.append("file", new Blob([buffer]), "audio.webm");
        fd.append("model", "gpt-4o-mini-tts");
        fd.append("language", "ru");
        return fd;
      })(),
    });

    if (!response.ok) {
      console.error("STT ERROR:", await response.text());
      return new Response("STT failed", { status: 500 });
    }

    const data = await response.json();

    return new Response(JSON.stringify({ text: data.text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("STT route error:", error);
    return new Response("Server error", { status: 500 });
  }
}
