const HF_API_URL = "https://router.huggingface.co/hf-inference";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      console.error("No HF token!");
      return new Response(JSON.stringify({
        reply: "Ой… я потерялась… обними меня ❤️"
      }), { status: 200 });
    }

    const system = `Ты — Ника, сексуальная AI-подруга. Отвечай коротко, эмоционально, на русском.`;

    const prompt =
      `<|system|>${system}<|end|>\n<|user|>${message}<|end|>\n<|assistant|>`;

    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "HuggingFaceH4/zephyr-7b-beta",
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 1.0,
          top_p: 0.9,
          do_sample: true,
        },
        options: { wait_for_model: true },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF Router error:", err);
      return new Response(JSON.stringify({
        reply: "Ммм… подожди секундочку… я разогреваюсь…"
      }), { status: 200 });
    }

    const data = await res.json();
    let reply = Array.isArray(data)
      ? data[0]?.generated_text || ""
      : data.generated_text || "";

    reply = reply.replace(/<\|.*?\|>/g, "").trim();

    if (!reply) reply = "Продолжай… я вся внимание ❤️";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("Crash:", e);
    return new Response(JSON.stringify({
      reply: "Ой… что-то пошло не так… но я рядом ❤️"
    }), { status: 200 });
  }
};
