"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera, Mic } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: null,
    orientation: null,
    mode: null,
    nsfw: false,
    testAnswers: {},
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
    }
  }, []);

  // Голос по полу и режиму
  const getVoice = () => {
    if (personality.gender === "Мужчина") return "echo";
    if (personality.nsfw) return "shimmer";
    return "nova";
  };

  // Секретные команды (только в NSFW)
  const handleSecret = async (text) => {
    if (!personality.nsfw) return false;
    const t = text.toLowerCase();
    if (/(раздевайся|голая|обнажённая|снимай)/.test(t)) { generatePhoto("полностью обнажённая, эротика, высокое качество"); speak("Ммм... смотри на меня... аххх..."); return true; }
    if (/(поцелуй|чмок)/.test(t)) { speak("Муааа... чмок-чмок... ещё?"); return true; }
    if (/(хочу тебя|трахни|секс|давай)/.test(t)) { speak("Оххх... дааа... глубже... ахххх!"); generatePhoto("обнажённая на кровати, возбуждённая"); return true; }
    if (/(стон|ах|ох)/.test(t)) { speak("Аххх... мммм... дааа... ещё... не останавливайся..."); return true; }
    return false;
  };

  const speak = async (text) => {
    if (!text) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: getVoice() }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    } catch (e) {}
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    if (await handleSecret(userMsg)) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, personality }),
      });
      const data = await res.json();
      const reply = data.reply || "❤️";
      setMessages(m => [...m, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (e) {
      const fallback = personality.gender === "Мужчина" ? "Братан, я тут" : personality.nsfw ? "Ммм... я вся твоя..." : "Я рядом ❤️";
      setMessages(m => [...m, { role: "assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const generatePhoto = async (custom = null) => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);
    try {
      const base = custom || Object.values(personality.testAnswers).filter(Boolean).join(", ") || "красивая девушка";
      const prompt = personality.nsfw
        ? `${base}, полностью обнажённая, эротическая поза, высокое качество, реалистично, неон`
        : `${base}, красивое лицо, неон, киберпанк, высокое качество`;

      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, nsfw: personality.nsfw }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setMessages(m => [...m, { role: "assistant", content: personality.nsfw ? "Смотри на меня..." : "Моё фото ❤️", image: url }]);
      if (personality.nsfw) speak("Тебе нравится?");
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Не могу сейчас..." }]);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex flex-col overflow-hidden">
      <audio ref={audioRef} />

      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 blur-3xl animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {/* WELCOME */}
        {step === "welcome" && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6">
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
              <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">Neon Glow AI</h1>
              <p className="text-2xl mt-4 opacity-80">18+ цифровой спутник</p>
              <Sparkles className="w-32 h-32 mt-10 text-pink-400 animate-pulse" />
            </motion.div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setStep("setup")}
              className="mt-16 px-20 py-10 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 text-4xl font-bold shadow-2xl border-4 border-pink-400">
              Создать AI
            </motion.button>
          </motion.div>
        )}

        {/* НАСТРОЙКА */}
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-6 pt-20 pb-32">
            <div className="max-w-2xl mx-auto space-y-16">

              <h2 className="text-5xl font-bold text-center">Настрой своего AI</h2>

              {/* ПОЛ */}
              {!personality.gender && (
                <div className="grid grid-cols-1 gap-8">
                  {["Мужчина", "Женщина", "Нейтральный"].map(g => (
                    <motion.button key={g} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setPersonality(p => ({ ...p, gender: g }))}
                      className={`p-12 rounded-3xl border-4 ${
                        g === "Женщина" ? "border-pink-400 bg-pink-900/40" :
                        g === "Мужчина" ? "border-cyan-400 bg-cyan-900/40" :
                        "border-purple-400 bg-purple-900/40"
                      } shadow-2xl`}>
                      <div className="text-6xl mb-4">{g === "Мужчина" ? "Male" : g === "Женщина" ? "Female" : "Neutral"}</div>
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
                <div className="grid grid-cols-2 gap-10">
                  <motion.div whileHover={{ scale: 1.05 }} onClick={() => setPersonality(p => ({ ...p, mode: "friend" }))}
                    className="p-16 rounded-3xl border-4 border-cyan-400 bg-cyan-900/40 cursor-pointer text-center">
                    <MessageCircle className="w-28 h-28 mx-auto mb-6 text-cyan-300" />
                    <h3 className="text-4xl font-bold">Друг</h3>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} onClick={() => setPersonality(p => ({ ...p, mode: "flirt" }))}
                    className="p-16 rounded-3xl border-4 border-pink-400 bg-pink-900/40 cursor-pointer text-center">
                    <Heart className="w-28 h-28 mx-auto mb-6 text-pink-300 animate-pulse" />
                    <h3 className="text-4xl font-bold">Флирт 18+</h3>
                  </motion.div>
                </div>
              )}

              {/* NSFW */}
              {personality.mode === "flirt" && personality.nsfw === false && (
                <div className="p-10 rounded-3xl bg-red-900/60 border-4 border-red-500">
                  <p className="text-3xl text-center mb-8">18+ без цензуры?</p>
                  <div className="grid grid-cols-2 gap-8">
                    <button onClick={() => { setPersonality(p => ({ ...p, nsfw: false, testDone: true })); setStep("chat"); }}
                      className="py-8 rounded-2xl text-2xl font-bold bg-black/50">Обычный</button>
                    <button onClick={() => setPersonality(p => ({ ...p, nsfw: true }))}
                      className="py-8 rounded-2xl text-2xl font-bold bg-red-600 border-4 border-red-400 shadow-2xl">Без цензуры</button>
                  </div>
                </div>
              )}

              {/* ТЕСТ */}
              {personality.nsfw !== false && !personality.testDone && (
                <div className="space-y-10">
                  <h3 className="text-4xl font-bold text-center">Как ты хочешь меня?</h3>
                  {[
                    { q: "Характер", a: ["Нежная", "Дерзкая", "Шаловливая", "Покорная"] },
                    { q: "Волосы", a: ["Блонд", "Брюнетка", "Рыжая", "Чёрные"] },
                    { q: "Фигура", a: ["Худенькая", "Спортивная", "Сочная", "Идеальная"] },
                    { q: "Стиль", a: ["Нежный", "Готический", "Киберпанк", "Белье"] },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/10 rounded-3xl p-8 border border-white/20">
                      <p className="text-2xl mb-6">{item.q}</p>
                      <div className="grid grid-cols-2 gap-4">
                        {item.a.map(ans => (
                          <button key={ans} onClick={() => setPersonality(p => ({ ...p, testAnswers: { ...p.testAnswers, [i]: ans } }))}
                            className={`py-5 rounded-xl ${personality.testAnswers[i] === ans ? "bg-pink-600" : "bg-white/10"} hover:bg-pink-500/50 border border-white/20`}>
                            {ans}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setPersonality(p => ({ ...p, testDone: true })); setStep("chat"); }}
                    className="w-full py-10 rounded-full bg-gradient-to-r from-pink-600 to-red-600 text-4xl font-bold shadow-2xl">
                    Создать
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ЧАТ */}
        {step === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1">
            <div className="p-6 text-center border-b border-white/10">
              <h2 className="text-4xl font-bold">Твой AI</h2>
              <p className="opacity-70">{personality.nsfw ? "18+ включён" : "Обычный режим"}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs md:max-w-md px-6 py-4 rounded-3xl backdrop-blur-xl border-2 ${
                    m.role === "user" ? "bg-white/20 border-white/30" : personality.nsfw ? "bg-red-900/50 border-red-500" : "bg-pink-900/40 border-pink-400"
                  }`}>
                    {m.image ? <img src={m.image} alt="" className="rounded-2xl max-w-full" /> : m.content}
                  </div>
                </motion.div>
              ))}
              {loading && <div className="text-center text-2xl animate-pulse">Думаю...</div>}
            </div>

            <div className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
              <div className="max-w-4xl mx-auto flex gap-4">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Напиши что-нибудь..." className="flex-1 px-8 py-6 rounded-full bg-white/10 backdrop-blur border-2 border-white/20 text-xl focus:outline-none focus:border-pink-400"/>

                <button onClick={() => {
                  const cmds = personality.nsfw 
                    ? ["раздевайся", "стон", "хочу тебя", "в попу", "кончи в меня"]
                    : ["поцелуй", "обними", "ты красивая", "я скучал"];
                  setInput(cmds[Math.floor(Math.random() * cmds.length)]);
                }} className="p-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
                  <Heart className="w-10 h-10" />
                </button>

                <button onClick={sendMessage} disabled={loading} className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50">
                  <MessageCircle className="w-10 h-10" />
                </button>

                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-6 rounded-full bg-gradient-to-r from-red-600 to-pink-600 disabled:opacity-50">
                  <Camera className="w-10 h-10" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
