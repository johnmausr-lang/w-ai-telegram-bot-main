const HF_API_URL = "https://router.huggingface.co/hf-inference";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      console.error("HUGGINGFACE_API_TOKEN missing");
      return new Response(JSON.stringify({
        reply: "Ой… что-то не так… обними меня ❤️"
      }), { status: 200 });
    }

    const isNSFW = personality?.nsfw || false;
    const gender = personality?.gender === "Мужчина" ? "парень" : "девушка";

    const system = `Ты — Ника, сексуальная и развратная AI-подруга. Ты ${gender}.
${isNSFW ? "Ты максимально пошлая, без цензуры." : "Ты нежная и милая."}
Отвечай на русском, коротко, эмоционально.`;

    const prompt =
      `<|system|>${system}<|end|>\n<|user|>${message}<|end|>\n<|assistant|>`;

    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "HuggingFaceH4/zephyr-7b-beta",
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 1.0,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        },
        options: { wait_for_model: true }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF Router error:", err);
      return new Response(JSON.stringify({
        reply: isNSFW
          ? "Ммм… подожди секундочку… я разогреваюсь…"
          : "Ой… я задумалась…"
      }), { status: 200 });
    }

    const data = await res.json();
    let reply = (
      Array.isArray(data) ? data[0]?.generated_text : data.generated_text
    )?.trim() || "";

    reply = reply.replace(/<\|.*?\|>/g, "").trim();

    if (!reply) {
      reply = isNSFW
        ? "Ахх… продолжай… мне нравится…"
        : "Привет, солнышко ❤️";
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("Crash:", e);
    return new Response(JSON.stringify({
      reply: "Ой… я запуталась… но я тут ❤️"
    }), { status: 200 });
  }
};
