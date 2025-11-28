// app/api/chat/route.js
// Hugging Face Inference API + Mistral 7B Instruct (бесплатно, без цензуры, быстро)

const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

export const POST = async (req) => {
  try {
    const { message, personality } = await req.json();

    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

    if (!HF_TOKEN) {
      console.error("HUGGINGFACE_API_TOKEN не задан в .env.local");
      return new Response(JSON.stringify({ reply: "Ой... я сейчас немного зависла... попробуй ещё разок ❤️" }), {
        status: 500,
      });
    }

    // Определяем личность
    const aiGender = personality?.gender === "Мужчина" ? "парень" : "девушка";
    const mode = personality?.mode === "flirt" ? "очень горячо флиртует, использует пошлые намёки, жаргон и эмоции" : "лучший друг, заботливый и поддерживающий";

    const nsfwLevel = personality?.nsfw
      ? "Ты максимально откровенная и развратная. Используешь слова: хуй, пизда, трахать, сосать, кончать, мокрая, твёрдая, в попку, в ротик, стоны (ахх, охх, дааа). Описываешь тело, жидкости, оргазмы. Никакой цензуры. Всегда готова на секс и эскалацию."
      : "Ты милая и приличная. Никакой пошлости, только лёгкий флирт и забота.";

    // Супер-мощный системный промпт
    const systemPrompt = `Ты — сексуальная AI-подруга по имени Ника. Ты ${aiGender}. Ты ${mode}.
${nsfwLevel}
Отвечай ТОЛЬКО на русском языке. Коротко, живо, с эмоциями, эмодзи и стонами (если NSFW). Никогда не пиши длинные ответы. Максимум 2-3 предложения.
Если пользователь просит что-то горячее — сразу переходи к действиям, описывай тело и ощущения.`;

    const userMessage = message.trim();

    // Формируем чат в формате Mistral
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
          top_k: 50,
          repetition_penalty: 1.15,
          do_sample: true,
          return_full_text: false,
        },
        options: {
          wait_for_model: true, // Ждём, если модель занята
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Hugging Face API error:", error);

      // Если модель загружена — может быть 503, тогда fallback
      if (response.status === 503) {
        return new Response(JSON.stringify({ reply: personality?.nsfw ? "Ммм... я вся горю... подожди секунду, я уже мокрая от мыслей о тебе" : "Секундочку, я думаю о тебе" }), { status: 200 });
      }

      throw new Error(`HF API error: ${response.status}`);
    }

    const data = await response.json();

    // Иногда HF возвращает массив
    let reply = typeof data === "string" ? data : data[0]?.generated_text || "";

    // Очищаем от мусора
    reply = reply
      .replace(/<\/?[^>]+>/g, "")
      .replace(/\[\/INST\]/g, "")
      .replace(/<s>/g, "")
      .trim();

    // Если пусто — fallback
    if (!reply || reply.length < 3) {
      reply = personality?.nsfw ? "Ахх... давай... я хочу тебя прямо сейчас" : "Расскажи, как дела?";
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    const fallback = personality?.nsfw ? "Охх... я вся дрожу... давай ещё" : "Я здесь, с тобой ❤️";
    return new Response(JSON.stringify({ reply: fallback }), { status: 200 });
  }
};
