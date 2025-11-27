// app/page.jsx — ИСПРАВЛЕННАЯ И ПОЛНАЯ ВЕРСИЯ (с тремя шагами)
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome"); // welcome → setup → chat
  const [personality, setPersonality] = useState({
    gender: null,
    orientation: null,
    mode: null,
    intensity: 50,
    nsfw: false,
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // Автоскролл
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, generatingPhoto]);

  // TTS
  const speak = useCallback(async (text) => {
    if (!text) return;
    const voice = personality.gender === "Мужчина" ? "echo" : personality.nsfw ? "shimmer" : "nova";
    try {
      const res = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, voice }) });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) { console.error(e); }
  }, [personality]);

  // Генерация фото
  const generatePhoto = async (customPrompt = null) => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);
    const base = customPrompt || (personality.nsfw ? "обнажённая девушка, неон, эротика" : "красивая девушка, неон, киберпанк");
    try {
      const res = await fetch("/api/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: base, nsfw: personality.nsfw }) });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setMessages(m => [...m, { role: "assistant", image: url }]);
        speak("Вот твоё фото… нравится? 😏");
      }
    } catch (e) { console.error(e); }
    finally { setGeneratingPhoto(false); }
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: userMsg }], personality }),
      });
      if (res.ok) {
        const { reply } = await res.json();
        setMessages(m => [...m, { role: "assistant", content: reply }]);
        speak(reply);
      }
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Ой, что-то пошло не так… попробуй ещё раз ❤️" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen neon-bg flex flex-col">
      <audio ref={audioRef} className="hidden" />

      <AnimatePresence mode="wait">
        {/* 1. Welcome */}
        {step === "welcome" && (
          <motion.div key="welcome" className="flex-1 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Neon Glow AI
              </h1>
              <p className="text-2xl mb-12">Твой цифровой спутник 18+</p>
              <button onClick={() => setStep("setup")} className="px-12 py-6 text-2xl rounded-full bg-gradient-to-r from-purple-600 to-pink-600 pulse-glow spotlight-hover">
                Начать <Sparkles className="inline ml-3" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 2. Настройка личности */}
        {step === "setup" && (
          <motion.div key="setup" className="flex-1 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-black/50 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-purple-500/50">
              <h2 className="text-3xl font-bold mb-8 text-center">Настрой меня под себя</h2>

              <div className="space-y-6">
                <div>
                  <p className="mb-3">Я —</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPersonality(p => ({...p, gender: "Женщина"}))} className={`py-4 rounded-xl ${personality.gender === "Женщина" ? "bg-pink-600" : "bg-white/10"}`}>Девушка</button>
                    <button onClick={() => setPersonality(p => ({...p, gender: "Мужчина"}))} className={`py-4 rounded-xl ${personality.gender === "Мужчина" ? "bg-purple-600" : "bg-white/10"}`}>Парень</button>
                  </div>
                </div>

                <div>
                  <p className="mb-3">Режим общения</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPersonality(p => ({...p, mode: "flirt"}))} className={`py-4 rounded-xl ${personality.mode === "flirt" ? "bg-red-600" : "bg-white/10"}`}>Флирт 🔥</button>
                    <button onClick={() => setPersonality(p => ({...p, mode: "friend"}))} className={`py-4 rounded-xl ${personality.mode === "friend" ? "bg-blue-600" : "bg-white/10"}`}>Друг ❤️</button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>18+ режим</span>
                  <button
                    onClick={() => setPersonality(p => ({...p, nsfw: !p.nsfw}))}
                    className={`w-16 h-8 rounded-full ${personality.nsfw ? "bg-red-600" : "bg-gray-600"} relative`}>
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${personality.nsfw ? "right-1" : "left-1"}`} />
                  </button>
                </div>

                <button
                  onClick={() => setStep("chat")}
                  disabled={!personality.gender}
                  className="w-full py-5 text-xl rounded-full bg-gradient-to-r from-purple-600 to-pink-600 disabled:opacity-50 pulse-glow"
                >
                  В чат 🚀
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. Чат */}
        {step === "chat" && (
          <motion.div key="chat" className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 pb-32">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md px-6 py-4 rounded-3xl backdrop-blur border-2 shadow-lg ${m.role === "user" ? "border-white/30 bg-white/20" : personality.nsfw ? "border-red-500 bg-red-900/50 pulse-glow" : "border-pink-400 bg-pink-900/40 pulse-glow"}`}>
                      {m.image ? <img src={m.image} alt="photo" className="rounded-2xl max-w-full" /> : m.content}
                    </div>
                  </motion.div>
                ))}
                {loading && <div className="text-center animate-pulse text-2xl">Думает...</div>}
                {generatingPhoto && <div className="text-center animate-pulse text-2xl">Генерирую фото...</div>}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 bg-black/70 backdrop-blur-md border-t border-white/10 sticky bottom-0">
              <div className="max-w-4xl mx-auto flex gap-3 items-center">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="Напиши..." className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 focus:border-pink-400 outline-none" />

                <button onClick={() => setInput(["поцелуй", "обними", "раздевайся", "хочу тебя"][Math.floor(Math.random()*4)])} className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 pulse-glow">
                  <Heart className="w-7 h-7" />
                </button>

                <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-30 pulse-glow">
                  <MessageCircle className="w-7 h-7" />
                </button>

                <button onClick={() => generatePhoto()} disabled={generatingPhoto} className="p-4 rounded-full bg-gradient-to-r from-red-600 to-pink-600 disabled:opacity-30 pulse-glow">
                  <Camera className="w-7 h-7" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
