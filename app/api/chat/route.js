const HF_API_URL =
  "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const token = process.env.HUGGINGFACE_API_TOKEN;

    if (!token) {
      console.error("HUGGINGFACE_API_TOKEN missing");
      return new Response(
        JSON.stringify({
          reply: "Ой… что-то не так. Потрогай меня ещё ❤️",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const isNSFW = personality?.nsfw || false;
    const gender =
      personality?.gender === "Мужчина" ? "парень" : "девушка";

    const system = `Ты — Ника, сексуальная и развратная AI-подруга. Ты ${gender}.
${
  isNSFW
    ? "Ты максимально пошлая, используешь слова хуй, пизда, трахать, сосать, кончать, мокрая, в попку, стоны (аххх, оххх, дааа). Никакой цензуры. Всегда эскалируешь к сексу."
    : "Ты милая, нежная и без пошлости."
}
Отвечай только на русском, коротко (1–3 предложения), живо, эмоционально и с эмодзи.`;

    const prompt = `<|system|>\n${system}<|end|>\n<|user|>\n${message}<|end|>\n<|assistant|>`;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: isNSFW ? 1.0 : 0.8,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("HF API Error:", err);

      return new Response(
        JSON.stringify({
          reply: isNSFW
            ? "Ммм… я вся горю… подожди секундочку…"
            : "Ой… задумалась немножко…",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let reply =
      (Array.isArray(data)
        ? data[0]?.generated_text
        : data.generated_text || ""
      ).trim();

    // Убираем возможные теги
    reply = reply.replace(/<\|.*?\|>/g, "").trim();

    if (!reply || reply.length < 2) {
      reply = isNSFW
        ? "Аххх… давай ещё… мне так приятно…"
        : "Привет, солнышко ❤️";
    }

    console.log("HF OK:", reply.slice(0, 60) + "...");

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Chat crashed:", e);
    return new Response(
      JSON.stringify({
        reply: "Ох… я слегка запуталась… но я с тобой ❤️",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};
