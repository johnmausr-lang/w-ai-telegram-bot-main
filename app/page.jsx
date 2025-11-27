"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera, Mic } from "lucide-react";

export default function NeonGlowAI() {
  // БЛОК 1 — Импорты и состояние
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: null, // "Мужчина" | "Женщина" | "Нейтральный"
    orientation: null, // "Гетеро" | "Би" | "Гей/Лесби" | "Мне всё равно"
    mode: null, // "friend" | "flirt"
    nsfw: false,
    testAnswers: {}, // 0: характер, 1: волосы, 2: фигура, 3: стиль
    testDone: false,
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
    }
  }, []);

  // БЛОК 3 — Генерация фото (переименована в generatePhoto для единообразия, как в оригинале)
  const generatePhoto = async (customPrompt = null) => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);
    try {
      const base = customPrompt || Object.values(personality.testAnswers).filter(Boolean).join(", ");
      const prompt = personality.nsfw
        ? `${base}, обнажённая, эротическая поза, высокое качество, реалистично, красивое тело, неон`
        : `${base || "красивая девушка"}, красивое лицо, неон, киберпанк, высокое качество`;

      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, nsfw: personality.nsfw }),
      });
      if (!res.ok) throw new Error("Image generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const text = personality.nsfw ? "Смотри на меня... 🔥" : "Вот моё фото ❤️"; // Заменены скобки для эмодзи

      setMessages(m => [...m, { role: "assistant", content: text, image: url }]);
      if (personality.nsfw) speak("Тебе нравится?");
    } catch (e) {
      console.error("Image generation error:", e);
      setMessages(m => [...m, { role: "assistant", content: "Не могу сейчас сгенерировать фото..." }]);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // БЛОК 2 — Функция синтеза речи
  const speak = async (text) => {
    if (!text) return;
    const voice = personality.gender === "Мужчина"
      ? "echo"
      : personality.nsfw ? "shimmer" : "nova";
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.error("TTS error:", e);
    }
  };

  // БЛОК 2 — Секретные команды
  const handleSecretCommand = async (text) => {
    if (!personality.nsfw) return false;
    const lower = text.toLowerCase();
    const secrets = {
      "раздевайся|голая|обнаженная|снимай": () => {
        generatePhoto("полностью обнажённая девушка, сексуальная поза, высокое качество, реалистично");
        speak("Ммм... да, малыш... смотри на меня... ахххх...");
      },
      "поцелуй|чмок": () => speak("Муааа... чмок-чмок... ещё хочешь?"),
      "хочу тебя|трахни|секс|давай": () => {
        speak("Оххх... дааа... глубже... ахххх!");
        generatePhoto("очень возбуждённая, лежит на кровати обнажённая, эротика");
      },
      "стон|ах|ох|ммм": () => speak("Аххх... мммм... дааа... ещё... не останавливайся..."),
      "на колени|отсоси|в рот": () => {
        speak("Даа... бери в ротик... глубже...");
        generatePhoto("на коленях, рот открыт, эротика");
      },
      "кончи|сперма|кончил": () => {
        speak("Дааа... заливай меня... я вся твоя...");
        generatePhoto("сперма на лице, очень возбуждённая, эротика");
      },
      // Добавим команду для фото
      "фото|покажи себя": () => {
          generatePhoto();
          speak("Тебе нравится? 😏");
      }
    };
    for (const [keys, action] of Object.entries(secrets)) {
      if (keys.split("|").some(k => lower.includes(k))) {
        action();
        return true;
      }
    }
    return false;
  };

  // БЛОК 3 — Отправка сообщения
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    if (await handleSecretCommand(userMsg)) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, personality }),
      });
      if (!res.ok) throw new Error("Chat API failed");

      const data = await res.json();
      const reply = data.reply || "❤️";
      
      // ИСПРАВЛЕНИЕ: Замена set20(setMessages...) на корректный вызов setMessages
      setMessages(m => [...m, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (e) {
      console.error("Chat message error:", e);
      const fallback = personality.gender === "Мужчина"
        ? "Я здесь, братан"
        : personality.nsfw ? "Ммм... я вся твоя..." : "Я рядом ❤️";
      setMessages(m => [...m, { role: "assistant", content: fallback }]);
      speak(fallback);
    } finally {
      setLoading(false);
    }
  };


  // БЛОК 4 — return + фикс экрана
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex flex-col">
      <audio ref={audioRef} />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 blur-3xl animate-pulse" />
      </div>
      <AnimatePresence mode="wait">
        {/* Добавление flex-1 для правильного заполнения экрана */}
        <div className="flex-1 flex flex-col min-h-screen">

          {/* БЛОК 5 — Welcome экран */}
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center flex-1 p-6">
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-center">
                <h1 className="text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">Neon Glow AI</h1>
                <p className="text-2xl mb-12 opacity-80">18+ цифровой спутник</p>
                <Sparkles className="w-32 h-32 mx-auto mb-12 text-pink-400 animate-pulse" />
              </motion.div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => setStep("setup")}
                className="px-20 py-10 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 text-4xl font-bold shadow-2xl shadow-pink-500/70 border-4 border-pink-400/60">
                Создать своего AI
              </motion.button>
            </motion.div>
          )}

          {/* БЛОК 6 — Полный экран настройки */}
          {step === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 overflow-y-auto bg-black/90 backdrop-blur-xl p-6 pt-20 pb-40">
              <div className="max-w-2xl mx-auto space-y-16">
                <h2 className="text-center text-5xl font-bold">Настрой своего AI</h2>
                {/* ПОЛ */}
                {!personality.gender && (
                  <div className="grid grid-cols-1 gap-8">
                    {["Мужчина", "Женщина", "Нейтральный"].map(g => (
                      <motion.button key={g} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setPersonality(p => ({ ...p, gender: g }))}
                        className={`p-12 rounded-3xl backdrop-blur border-4 ${
                          g === "Женщина" ? "border-pink-400 bg-pink-900/40" :
                          g === "Мужчина" ? "border-cyan-400 bg-cyan-900/30" :
                          "border-purple-400 bg-purple-900/30"
                        } shadow-2xl`}>
                        {/* ИСПРАВЛЕНИЕ: Замена англ. слов на эмодзи, т.к. текст на русском */}
                        <div className="text-6xl mb-4">
                          {g === "Мужчина" ? "♂" : g === "Женщина" ? "♀" : "⚪"}
                        </div>
                        <div className="text-3xl font-bold">{g}</div>
                      </motion.button>
                    ))}
                  </div>
                )}
                {/* ОРИЕНТАЦИЯ */}
                {personality.gender && !personality.orientation && (
                  <div className="flex flex-wrap justify-center gap-6">
                    {["Гетеро", "Би", "Гей/Лесби", "Мне всё равно"].map(o => (
                      <motion.button key={o} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setPersonality(p => ({ ...p, orientation: o }))}
                        className="px-10 py-5 rounded-full bg-white/10 backdrop-blur border-2 border-white/30 hover:border-pink-400 text-xl">
                        {o}
                      </motion.button>
                    ))}
                  </div>
                )}
                {/* РЕЖИМ */}
                {personality.orientation && !personality.mode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <motion.div whileHover={{ scale: 1.05 }} onClick={() => setPersonality(p => ({ ...p, mode: "friend" }))}
                      className="p-16 rounded-3xl backdrop-blur border-4 border-cyan-400 bg-cyan-900/30 cursor-pointer text-center">
                      <MessageCircle className="w-32 h-32 mx-auto mb-6 text-cyan-300" />
                      <h3 className="text-5xl font-bold">Дружеский</h3>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} onClick={() => setPersonality(p => ({ ...p, mode: "flirt" }))}
                      className="p-16 rounded-3xl backdrop-blur border-4 border-pink-400 bg-pink-900/40 cursor-pointer text-center">
                      <Heart className="w-32 h-32 mx-auto mb-6 text-pink-300 animate-pulse" />
                      <h3 className="text-5xl font-bold">Флирт 18+</h3>
                    </motion.div>
                  </div>
                )}
                {/* NSFW */}
                {personality.mode === "flirt" && !personality.testDone && ( // Убрал !personality.nsfw, чтобы показать переключатель всегда
                  <div className="p-10 rounded-3xl bg-red-900/60 border-4 border-red-500 backdrop-blur-xl">
                    <p className="text-3xl text-center mb-8">18+ режим</p>
                    <div className="grid grid-cols-2 gap-8">
                      <button onClick={() => setPersonality(p => ({ ...p, nsfw: false }))}
                        className={`py-8 rounded-2xl text-2xl font-bold ${!personality.nsfw ? "bg-white/20 border-4 border-white" : "bg-black/50"}`}>
                        Обычный
                      </button>
                      <button onClick={() => setPersonality(p => ({ ...p, nsfw: true }))}
                        className={`py-8 rounded-2xl text-2xl font-bold ${personality.nsfw ? "bg-red-600 border-4 border-red-400 shadow-2xl shadow-red-500/70" : "bg-black/50"}`}>
                        Без цензуры
                      </button>
                    </div>
                    {personality.nsfw && <p className="text-center mt-6 text-red-300 text-xl">Фото и голос станут ОЧЕНЬ откровенными</p>}
                  </div>
                )}
                {/* ТЕСТ ЛИЧНОСТИ */}
                {personality.mode && !personality.testDone && ( // Упростил условие
                  <div className="space-y-10">
                    <h3 className="text-4xl font-bold text-center">Расскажи о себе</h3>
                    {[
                      { q: "Характер?", a: ["Нежная", "Смелая", "Шаловливая", "Таинственная"] },
                      { q: "Цвет волос?", a: ["Блонд", "Брюнетка", "Рыжая", "Чёрные"] },
                      { q: "Фигура?", a: ["Худенькая", "Спортивная", "Сочная", "Идеальная"] },
                      { q: "Стиль?", a: ["Нежный", "Готический", "Киберпанк", "Белье"] },
                    ].map((item, i) => (
                      <div key={i} className="backdrop-blur bg-white/10 rounded-3xl p-8 border border-white/20">
                        <p className="text-2xl mb-6">{item.q}</p>
                        <div className="grid grid-cols-2 gap-4">
                          {item.a.map(ans => (
                            <button key={ans} onClick={() => setPersonality(p => ({ ...p, testAnswers: { ...p.testAnswers, [i]: ans } }))}
                              className={`py-5 rounded-xl transition ${personality.testAnswers[i] === ans ? "bg-pink-600" : "bg-white/10"} border border-white/20 hover:bg-pink-500/30`}>
                              {ans}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { setPersonality(p => ({ ...p, testDone: true })); setStep("chat"); }}
                      className="w-full py-10 rounded-full bg-gradient-to-r from-pink-600 to-red-600 text-4xl font-bold shadow-2xl">
                      Создать моего AI
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* БЛОК 7 — Чат + сердечко с секретами */}
          {step === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1">
              <div className="p-6 text-center border-b border-white/10">
                <h2 className="text-4xl font-bold">Твой AI</h2>
                <p className="opacity-70">{personality.nsfw ? "18+ режим" : "Обычный режим"}</p>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md px-6 py-4 rounded-3xl backdrop-blur-xl border-2 ${
                      m.role === "user" ? "bg-white/20 border-white/30" :
                       personality.nsfw ? "bg-red-900/50 border-red-500" : "bg-pink-900/40 border-pink-400/50"
                    }`}>
                      {m.image ? <img src={m.image} alt="AI" className="rounded-2xl max-w-full" /> : m.content}
                    </div>
                  </motion.div>
                ))}
                {loading && <div className="text-center animate-pulse text-2xl">Думает...</div>}
              </div>
              <div className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
                <div className="max-w-4xl mx-auto flex gap-4">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Напиши что-нибудь..." className="flex-1 px-8 py-6 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 text-xl focus:outline-none focus:border-pink-400"/>
                  
                  {/* Кнопка "Сердце" для рандомных команд */}
                  <button onClick={() => {
                    const cmds = personality.nsfw
                       ? ["раздевайся", "стон", "хочу тебя", "на колени", "кончи"] // Вставил существующие секреты
                      : ["поцелуй", "обними", "ты красивая", "спасибо"];
                    setInput(cmds[Math.floor(Math.random() * cmds.length)]);
                  }} className="p-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
                    <Heart className="w-10 h-10" />
                  </button>
                  
                  {/* Кнопка "Сообщение" для отправки */}
                  <button onClick={sendMessage} disabled={loading} className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50">
                    <MessageCircle className="w-10 h-10" />
                  </button>
                  
                  {/* Кнопка "Камера" для фото */}
                  <button onClick={generatePhoto} disabled={generatingPhoto} className="p-6 rounded-full bg-gradient-to-r from-red-600 to-pink-600 disabled:opacity-50">
                    <Camera className="w-10 h-10" />
                  </button>
                  
                  {/* Кнопка "Микрофон" (заглушка) */}
                  <button disabled className="p-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-50">
                    <Mic className="w-10 h-10" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
