export const runtime = "edge";

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "alloy", 
        format: "mp3",
        input: text,
      }),
    });

    if (!response.ok) {
      console.error("TTS ERROR:", await response.text());
      return new Response("TTS failed", { status: 500 });
    }

    const audio = await response.arrayBuffer();

    return new Response(audio, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });

  } catch (error) {
    console.error("TTS route error:", error);
    return new Response("Server error", { status: 500 });
  }
}
