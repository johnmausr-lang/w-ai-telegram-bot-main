"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Volume2, Camera } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: null,
    orientation: null,
    mode: null,
    intensity: 50,
    testAnswers: {},
    testDone: false,
    nsfw: false, // ← NSFW режим
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const audioRef = useRef(null);

  // Telegram Fix
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
    }
  }, []);

  // СЕКРЕТНЫЕ КОМАНДЫ + СТОНЫ
  const handleSecretCommand = async (text) => {
    if (!personality.nsfw) return false;
    const lower = text.toLowerCase();
    
    // Временно объявляем generatePhoto, чтобы избежать ошибки "not defined" при вызове в этой функции
    // Реальная функция generatePhoto находится ниже.
    const generatePhoto = async (customPrompt = null) => {
        if (generatingPhoto) return;
        setGeneratingPhoto(true);
        try {
          const base = customPrompt || `сексуальная ${personality.gender === "Женщина" ? "девушка" : "парень"}, ${Object.values(personality.testAnswers).join(", ")}`;
          const prompt = personality.nsfw
            ? `${base}, обнажённая, эротическая поза, высокое качество, реалистично, красивое тело`
            : `${base}, красивое лицо, неон, киберпанк, высокое качество`;
          const res = await fetch("/api/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, nsfw: personality.nsfw }),
          });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const text = personality.nsfw ? "Смотри на меня... 🔥" : "Вот моё фото ❤️";
          setMessages(m => [...m, { role: "assistant", content: text, image: url }]);
          if (personality.nsfw) speak("Тебе нравится? 😏");
        } catch (e) {
          setMessages(m => [...m, { role: "assistant", content: "Не могу сейчас..." }]);
        } finally {
          setGeneratingPhoto(false);
        }
    };


    if (lower.includes("раздевайся") || lower.includes("голая") || lower.includes("снимай")) {
      generatePhoto("полностью обнажённая девушка, сексуальная поза, эротика, высокое качество, реалистично");
      speak("Ммм... да, малыш... смотри на меня... ахххх...");
      return true;
    }
    if (lower.includes("поцелуй") || lower.includes("чмок") || lower.includes("целую")) {
      speak("Муааа... чмок-чмок... ещё хочешь? 😘");
      return true;
    }
    if (lower.includes("хочу тебя") || lower.includes("трахни") || lower.includes("секс")) {
      speak("Оххх... дааа... я тоже тебя хочу... ммм... глубже... ахххх!");
      generatePhoto("очень возбуждённая, лежит на кровати обнажённая, эротика");
      return true;
    }
    if (lower.includes("стон") || lower.includes("ах") || lower.includes("ох")) {
      speak("Аххх... мммм... дааа... ещё... о боже... не останавливайся...");
      return true;
    }
    return false;
  };

  const speak = async (text) => {
    if (!text) return;
    const voice = personality.nsfw ? "shimmer" : personality.gender === "Женщина" ? "nova" : "echo";
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {}
  };

  // ОТПРАВКА СООБЩЕНИЯ
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
      const data = await res.json();
      const reply = data.reply || "❤️";
      setMessages(m => [...m, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (e) {
      const fallback = personality.nsfw ? "Ммм... я вся твоя..." : "Я рядом!";
      setMessages(m => [...m, { role: "assistant", content: fallback }]);
      speak(fallback);
    } finally {
      setLoading(false);
    }
  };

  // ГЕНЕРАЦИЯ ФОТО (с NSFW)
  const generatePhoto = async (customPrompt = null) => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);
    try {
      const base = customPrompt || `сексуальная ${personality.gender === "Женщина" ? "девушка" : "парень"}, ${Object.values(personality.testAnswers).join(", ")}`;
      const prompt = personality.nsfw
        ? `${base}, обнажённая, эротическая поза, высокое качество, реалистично, красивое тело`
        : `${base}, красивое лицо, неон, киберпанк, высокое качество`;
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, nsfw: personality.nsfw }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const text = personality.nsfw ? "Смотри на меня... 🔥" : "Вот моё фото ❤️";
      setMessages(m => [...m, { role: "assistant", content: text, image: url }]);
      if (personality.nsfw) speak("Тебе нравится? 😏");
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Не могу сейчас..." }]);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // РЕНДЕРИНГ КОМПОНЕНТА
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white overflow-hidden relative">
      <audio ref={audioRef} />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 blur-3xl animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-screen p-6">
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-center">
              <h1 className="text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">Neon Glow AI</h1>
              <p className="text-2xl mb-12 opacity-80">18+ цифровой спутник</p>
              <Sparkles className="w-32 h-32 mx-auto mb-12 text-pink-400 animate-pulse" />
            </motion.div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); setStep("setup"); }}
              className="px-20 py-10 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 border-4 border-pink-400/60 text-4xl font-bold shadow-2xl shadow-pink-500/70 z-50">
              Создать своего AI
            </motion.button>
          </motion.div>
        )}

        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="min-h-screen p-6 flex flex-col overflow-y-auto">

            <h2 className="text-5xl font-bold text-center mb-12">Настрой своего AI</h2>

            {/* Пол */}
            {!personality.gender && (
              <div className="grid grid-cols-1 gap-8 max-w-md mx-auto">
                {["Мужчина", "Женщина", "Нейтральный"].map(g => (
                  <motion.button key={g} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.preventDefault(); setPersonality(p => ({ ...p, gender: g })); }}
                    className={`p-12 rounded-3xl backdrop-blur-xl border-4 ${g === "Женщина" ? "border-pink-400 bg-pink-900/40" : g === "Мужчина" ? "border-cyan-400 bg-cyan-900/30" : "border-purple-400 bg-purple-900/30"} shadow-2xl z-50`}>
                    <div className="text-8xl mb-4">{g === "Мужчина" ? "♂" : g === "Женщина" ? "♀" : "⚪"}</div>
                    <div className="text-3xl font-bold">{g}</div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Ориентация */}
            {personality.gender && !personality.orientation && (
              <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto">
                {["Гетеро", "Би", "Гей/Лесби", "Мне всё равно"].map(o => (
                  <motion.button key={o} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.preventDefault(); setPersonality(p => ({ ...p, orientation: o })); }}
                    className="px-12 py-6 rounded-full bg-white/10 backdrop-blur border-2 border-white/30 hover:border-pink-400 z-50">
                    {o}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Режим */}
            {personality.orientation && !personality.mode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <motion.div whileHover={{ scale: 1.05 }} onClick={(e) => { e.preventDefault(); setPersonality(p => ({ ...p, mode: "friend" })); }}
                  className="p-16 rounded-3xl backdrop-blur-xl border-4 border-cyan-400 bg-cyan-900/30 cursor-pointer z-50 text-center">
                  <MessageCircle className="w-32 h-32 mx-auto mb-6 text-cyan-300" />
                  <h3 className="text-5xl font-bold">Дружеский</h3>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} onClick={(e) => { e.preventDefault(); setPersonality(p => ({ ...p, mode: "flirt" })); }}
                  className="p-16 rounded-3xl backdrop-blur-xl border-4 border-pink-400 bg-pink-900/40 cursor-pointer z-50 text-center">
                  <Heart className="w-32 h-32 mx-auto mb-6 text-pink-300 animate-pulse" />
                  <h3 className="text-5xl font-bold">Флирт 18+</h3>
                </motion.div>
              </div>
            )}

            {/* NSFW ПЕРЕКЛЮЧАТЕЛЬ */}
            {personality.mode === "flirt" && !personality.testDone && (
              <div className="mt-16 p-10 rounded-3xl bg-red-900/50 border-4 border-red-500 backdrop-blur-xl max-w-2xl mx-auto">
                <p className="text-3xl text-center mb-8">Взрослый режим</p>
                <div className="grid grid-cols-2 gap-8">
                  <button onClick={(e) => { e.preventDefault(); setPersonality(p => ({ ...p, nsfw: false })); }}
                    className={`py-8 rounded-2xl text-2xl font-bold transition ${!personality.nsfw ? "bg-white/20 border-4 border-white" : "bg-black/50"}`}>
                    Обычный
                  </button>
                  <button onClick={(e) => { e.preventDefault(); setPersonality(p => ({ ...p, nsfw: true })); }}
                    className={`py-8 rounded-2xl text-2xl font-bold transition ${personality.nsfw ? "bg-red-600 border-4 border-red-400 shadow-2xl shadow-red-500/70" : "bg-black/50"}`}>
                    18+ Без цензуры
                  </button>
                </div>
                {personality.nsfw && <p className="text-center mt-6 text-red-300 text-xl">Фото и голос станут **ОЧЕНЬ** откровенными</p>}
              </div>
            )}

            {/* ТЕСТ ЛИЧНОСТИ */}
            {personality.mode && !personality.testDone && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-2xl mx-auto mt-12">
                <h3 className="text-4xl font-bold text-center">Расскажи о себе</h3>
                {[
                  { q: "Характер?", a: ["Нежная", "Смелая", "Шаловливая", "Таинственная"] },
                  { q: "Цвет волос?", a: ["Блонд", "Брюнетка", "Рыжая", "Чёрные"] },
                  { q: "Фигура?", a: ["Худенькая", "Спортивная", "Сочная", "Идеальная"] },
                  { q: "Стиль?", a: ["Нежный", "Готический", "Киберпанк", "Белье"] },
                ].map((item, i) => (
                  <div key={i} className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                    <p className="text-2xl mb-6">{item.q}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {item.a.map(ans => (
                        <button key={ans} onClick={(e) => { e.preventDefault(); setPersonality(p => ({ ...p, testAnswers: { ...p.testAnswers, [i]: ans } })); }}
                          className={`py-5 rounded-xl transition ${personality.testAnswers[i] === ans ? "bg-pink-600 border-pink-400" : "bg-white/10"} border border-white/20 hover:bg-pink-500/30`}>
                          {ans}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.preventDefault(); setPersonality(p => ({ ...p, testDone: true })); setStep("chat"); }}
                  className="w-full py-10 rounded-full bg-gradient-to-r from-pink-600 to-red-600 text-4xl font-bold shadow-2xl z-50">
                  Создать моего AI
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-screen">
            <div className="p-6 text-center border-b border-white/10">
              <h2 className="text-4xl font-bold">Твой AI</h2>
              <p className="opacity-70">{personality.nsfw ? "🔞 18+ режим" : "Обычный режим"}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md px-6 py-4 rounded-3xl backdrop-blur-xl border-2 ${m.role === "user" ? "bg-white/20 border-white/30" : personality.nsfw ? "bg-red-900/50 border-red-500" : "bg-pink-900/40 border-pink-400/50"}`}>
                    {m.image ? <img src={m.image} alt="AI" className="rounded-2xl max-w-full" /> : m.content}
                  </div>
                </motion.div>
              ))}
              {loading && <div className="text-center animate-pulse text-2xl">Думает...</div>}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
              <div className="max-w-4xl mx-auto flex gap-4">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Напиши что-нибудь..." className="flex-1 px-8 py-6 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 text-xl focus:outline-none focus:border-pink-400"/>
                <button onClick={sendMessage} disabled={loading} className="p-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 disabled:opacity-50">
                  <Heart className="w-10 h-10" />
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
