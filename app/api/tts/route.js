export const runtime = "edge";

export async function POST(req) {
  try {
    const { text, voice = "nova" } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response("No text provided", { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
        format: "mp3",
      }),
    });

    if (!response.ok) {
      console.error("TTS ERROR:", await response.text());
      return new Response("TTS failed", { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (error) {
    console.error("TTS route error:", error);
    return new Response("Server error", { status: 500 });
  }
}
