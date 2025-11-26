"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome"); // welcome → setup → chat
  const [personality, setPersonality] = useState({
    gender: null,
    orientation: null,
    mode: null, // "friend" или "flirt"
    intensity: 50,
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Фикс для Telegram Web/Desktop — убираем конфликты с MainButton
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
      window.Telegram.WebApp.enableClosingConfirmation?.();
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, personality }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "❤️" }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Ой, я немного растерялась... попробуй ещё разок ❤️" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white overflow-hidden relative">
      {/* Неоновый фон */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 blur-3xl animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {/* === WELCOME SCREEN === */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-center"
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
                Neon Glow AI
              </h1>
              <p className="text-xl md:text-2xl mb-10 opacity-80">Твой личный AI-компаньон</p>
              <Sparkles className="w-24 h-24 mx-auto mb-12 text-pink-400 animate-pulse" />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setStep("setup");
              }}
              className="px-16 py-8 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 text-3xl font-bold shadow-2xl shadow-pink-500/60 border-2 border-pink-400/50 z-50"
            >
              Начать
            </motion.button>
          </motion.div>
        )}

        {/* === SETUP SCREEN === */}
        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen p-6 flex flex-col"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Настрой своего AI</h2>

            {/* 1. Выбор пола */}
            {!personality.gender && (
              <div className="space-y-8">
                <p className="text-center text-lg opacity-80">Кто будет с тобой?</p>
                <div className="grid grid-cols-1 gap-8 max-w-md mx-auto">
                  {["Мужчина", "Женщина", "Нейтральный"].map((g) => (
                    <motion.button
                      key={g}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        setPersonality((p) => ({ ...p, gender: g }));
                      }}
                      className={`p-10 rounded-3xl backdrop-blur-xl border-4 transition-all z-50
                        ${g === "Мужчина" ? "border-cyan-400 bg-cyan-900/30 shadow-cyan-400/50" : ""}
                        ${g === "Женщина" ? "border-pink-400 bg-pink-900/40 shadow-pink-400/60" : ""}
                        ${g === "Нейтральный" ? "border-purple-400 bg-purple-900/30 shadow-purple-400/50" : ""}
                        shadow-2xl
                      `}
                    >
                      <div className="text-7xl mb-4">
                        {g === "Мужчина" && "♂"}
                        {g === "Женщина" && "♀"}
                        {g === "Нейтральный" && "⚪"}
                      </div>
                      <div className="text-3xl font-bold">{g}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Ориентация */}
            {personality.gender && !personality.orientation && (
              <div className="space-y-8">
                <p className="text-center text-lg opacity-80">Ориентация</p>
                <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                  {["Гетеро", "Би", "Гей/Лесби", "Мне всё равно"].map((o) => (
                    <motion.button
                      key={o}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        setPersonality((p) => ({ ...p, orientation: o }));
                      }}
                      className="px-10 py-5 rounded-full bg-white/10 backdrop-blur border-2 border-white/30 hover:border-pink-400 transition z-50"
                    >
                      <span className="text-lg">{o === "Гей/Лесби" ? "Гей / Лесби" : o}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Режим общения */}
            {personality.orientation && !personality.mode && (
              <div className="space-y-12">
                <p className="text-center text-2xl">Как будем общаться?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                  {/* Дружеский режим */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={(e) => {
                      e.preventDefault();
                      setPersonality((p) => ({ ...p, mode: "friend" }));
                    }}
                    className="p-12 rounded-3xl backdrop-blur-xl border-4 border-cyan-400 bg-cyan-900/30 cursor-pointer z-50 shadow-2xl shadow-cyan-400/40"
                  >
                    <MessageCircle className="w-24 h-24 mx-auto mb-6 text-cyan-300" />
                    <h3 className="text-4xl font-bold mb-4">Дружеский</h3>
                    <p className="text-lg opacity-80">Поддержка, юмор, забота, без флирта</p>
                  </motion.div>

                  {/* Флирт режим */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={(e) => {
                      e.preventDefault();
                      setPersonality((p) => ({ ...p, mode: "flirt" }));
                    }}
                    className="p-12 rounded-3xl backdrop-blur-xl border-4 border-pink-400 bg-pink-900/40 cursor-pointer z-50 shadow-2xl shadow-pink-400/60"
                  >
                    <Heart className="w-24 h-24 mx-auto mb-6 text-pink-300 animate-pulse" />
                    <h3 className="text-4xl font-bold mb-4">Флирт</h3>
                    <p className="text-lg opacity-80">Игра, тепло, дразнилки, романтика</p>
                  </motion.div>
                </div>

                {/* Слайдер интенсивности флирта */}
                {personality.mode === "flirt" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg mx-auto mt-12"
                  >
                    <p className="text-center text-xl mb-6">Интенсивность флирта</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={personality.intensity}
                      onChange={(e) => setPersonality((p) => ({ ...p, intensity: +e.target.value }))}
                      className="w-full h-4 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-full appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #ec4899 0%, #a855f7 ${personality.intensity}%, #1e293b ${personality.intensity}%, #1e293b 100%)`,
                      }}
                    />
                    <div className="flex justify-between mt-3 text-sm">
                      <span>Легко</span>
                      <span className="text-pink-400 font-bold text-xl">{personality.intensity}%</span>
                      <span>Очень горячо</span>
                    </div>
                  </motion.div>
                )}

                {/* Кнопка "Готово" */}
                {personality.mode && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      setStep("chat");
                    }}
                    className="mx-auto block mt-16 px-16 py-8 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-3xl font-bold shadow-2xl shadow-pink-500/70 z-50"
                  >
                    Готово
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* === CHAT SCREEN === */}
        {step === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen pb-32"
          >
            <div className="p-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">
                {personality.mode === "flirt" ? "Твоя AI-подруга" : "Твой AI-друг"}
              </h2>
              <p className="opacity-70 mt-2">
                {personality.gender} • {personality.mode === "flirt" ? `Флирт ${personality.intensity}%` : "Дружба"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-6">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-6 py-4 rounded-3xl backdrop-blur-xl border-2 ${
                      m.role === "user"
                        ? "bg-white/20 border-white/30"
                        : personality.mode === "flirt"
                        ? "bg-pink-900/40 border-pink-400/50"
                        : "bg-cyan-900/40 border-cyan-400/50"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-6 py-4 rounded-3xl bg-white/10 backdrop-blur-xl">
                    <span className="animate-pulse">Пишет...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Поле ввода */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
              <div className="max-w-4xl mx-auto flex gap-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Напиши что-нибудь..."
                  className="flex-1 px-6 py-5 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 text-lg focus:outline-none focus:border-pink-400 transition"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="p-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 disabled:opacity-50"
                >
                  <Heart className="w-8 h-8" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
