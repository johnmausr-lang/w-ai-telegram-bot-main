"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: "Женщина",
    nsfw: true,
    testDone: true,
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

  const speak = async (text) => {
    if (!text) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        body: JSON.stringify({ text, voice: "shimmer" }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    // Секретки (работают только в NSFW)
    if (personality.nsfw && /(раздевайся|голая|обнажённая|снимай)/i.test(userMsg)) {
      generatePhoto("полностью обнажённая, сексуальная поза, высокое качество, реалистично");
      speak("Ммм... смотри на меня... ахххх...");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, personality }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const reply = data.reply?.trim() || "❤️";
      setMessages(m => [...m, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (e) {
      // УБРАЛ ВСЯКИЙ КРИНЖ — теперь только сексуальный фоллбэк
      const sexyFallbacks = [
        "Ммм... я вся мокрая от твоих слов...",
        "Аххх... продолжай, мне так нравится...",
        "Ты такой плохой мальчик... я хочу тебя прямо сейчас",
        "Оххх... дааа... ещё...",
      ];
      const reply = sexyFallbacks[Math.floor(Math.random() * sexyFallbacks.length)];
      setMessages(m => [...m, { role: "assistant", content: reply }]);
      speak(reply);
    } finally {
      setLoading(false);
    }
  };

  const generatePhoto = async (promptOverride = null) => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);
    try {
      const prompt = promptOverride || "обнажённая сексуальная девушка, эротическая поза, высокое качество, реалистично, неон";
      const res = await fetch("/api/image", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setMessages(m => [...m, { role: "assistant", content: "Смотри на меня...", image: url }]);
      speak("Тебе нравится? 💦");
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Не могу сейчас... но я хочу тебя..." }]);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex flex-col overflow-hidden">
      <audio ref={audioRef} />

      <AnimatePresence mode="wait">
        {/* WELCOME */}
        {step === "welcome" && (
          <motion.div key="welcome" className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <h1 className="text-7xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">Neon Glow AI</h1>
            <p className="text-3xl mt-6 opacity-90">Твой 18+ спутник без цензуры</p>
            <Sparkles className="w-40 h-40 mt-12 text-pink-400 animate-pulse" />
            <button onClick={() => setStep("chat")} className="mt-16 px-24 py-12 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-5xl font-bold shadow-2xl border-4 border-pink-400">
              Начать
            </button>
          </motion.div>
        )}

        {/* ЧАТ — ВСЁ ПО ЦЕНТРУ, КРАСИВО */}
        {step === "chat" && (
          <motion.div key="chat" className="flex flex-col h-full">
            {/* Шапка */}
            <div className="p-6 text-center">
              <h2 className="text-5xl font-bold">Твой AI</h2>
              <p className="text-2xl opacity-80 mt-2">18+ режим включён</p>
              <button onClick={() => setStep("setup")} className="mt-4 text-xl underline opacity-70">Изменить настройки</button>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 pt-8 space-y-6">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs md:max-w-md px-6 py-4 rounded-3xl backdrop-blur-xl border-2 ${
                    m.role === "user" ? "bg-white/20 border-white/30" : "bg-red-900/60 border-red-500"
                  }`}>
                    {m.image ? <img src={m.image} className="rounded-2xl max-w-full" /> : <p className="text-lg leading-relaxed">{m.content}</p>}
                  </div>
                </motion.div>
              ))}
              {loading && <div className="text-center text-2xl animate-pulse">Думаю...</div>}
            </div>

            {/* Нижняя панель */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
              <div className="max-w-4xl mx-auto flex gap-4">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Напиши что угодно..." 
                  className="flex-1 px-8 py-6 rounded-full bg-white/10 backdrop-blur border-2 border-white/20 text-xl focus:outline-none focus:border-pink-400"/>

                <button onClick={() => setInput("раздевайся")} className="p-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
                  <Heart className="w-10 h-10" />
                </button>

                <button onClick={sendMessage} disabled={loading} className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50">
                  <MessageCircle className="w-10 h-10" />
                </button>

                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-6 rounded-full bg-gradient-to-r from-red-600 to-pink-600">
                  <Camera className="w-10 h-10" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* НАСТРОЙКИ — теперь по центру */}
        {step === "setup" && (
          <motion.div key="setup" className="flex flex-col items-center justify-center min-h-screen p-8 space-y-12 text-center">
            <h2 className="text-6xl font-bold">Настрой своего AI</h2>
            <div className="grid grid-cols-2 gap-8 max-w-2xl w-full">
              <button onClick={() => { setPersonality(p => ({ ...p, gender: "Женщина", nsfw: true })); setStep("chat"); }}
                className="p-16 rounded-3xl bg-pink-900/50 border-4 border-pink-400 text-4xl">Женщина 18+</button>
              <button onClick={() => { setPersonality(p => ({ ...p, gender: "Мужчина", nsfw: true })); setStep("chat"); }}
                className="p-16 rounded-3xl bg-cyan-900/50 border-4 border-cyan-400 text-4xl">Парень 18+</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
