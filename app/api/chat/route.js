// app/api/chat/route.js
const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();
    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

    if (!HF_TOKEN) {
      return new Response(JSON.stringify({ reply: "Ой, я немного зависла… попробуй ещё разок ❤️" }), { status: 200 });
    }

    const aiGender = personality?.gender === "Мужчина" ? "парень" : "девушка";
    const mode = personality?.mode === "flirt" ? "очень горячо флиртует, использует пошлые намёки и эмоции" : "лучший друг, заботливый";
    const nsfwLevel = personality?.nsfw
      ? "Ты максимально развратная. Используешь слова: хуй, пизда, трахать, сосать, кончать, мокрая, в попку, стоны (аххх, оххх, дааа). Никакой цензуры, всегда эскалируешь к сексу."
      : "Ты милая и приличная, без пошлости.";

    const systemPrompt = `Ты — сексуальная AI-подруга Ника. Ты ${aiGender}. Ты ${mode}. ${nsfwLevel}
Отвечай только на русском, коротко, живо, с эмоциями и эмодзи. Максимум 2-3 предложения.`;

    const userMessage = message.trim();
    const prompt = `<s>[INST] ${systemPrompt}\n\nПользователь: ${userMessage} [/INST]`;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 280,
          temperature: personality?.nsfw ? 1.1 : 0.9,
          top_p: 0.95,
          repetition_penalty: 1.15,
          do_sample: true,
          return_full_text: false,
        },
        options: { wait_for_model: true },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("HF error:", err);
      return new Response(JSON.stringify({ reply: personality?.nsfw ? "Ммм… я вся горю от желания… подожди секунду" : "Ой, что-то задумалась…" }), { status: 200 });
    }

    const data = await response.json();
    let reply = typeof data === "string" ? data : data[0]?.generated_text || "";
    reply = reply.trim().replace(/\[\/INST\].*/s, "").trim();

    if (!reply) reply = personality?.nsfw ? "Аххх… давай ещё, я хочу тебя…" : "Расскажи, что у тебя на душе? ❤️";

    return new Response(JSON.stringify({ reply }), { status: 200 });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ reply: "Охх… я вся дрожу… давай ещё ❤️" }), { status: 200 });
  }
};
