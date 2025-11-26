"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Volume2 } from "lucide-react";

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

  // Автоопределение Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          personality,
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Ой, я немного застеснялась..." }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 blur-3xl animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-center"
            >
              <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-500">
                Neon Glow AI
              </h1>
              <p className="text-xl mb-10 opacity-80">Твой личный AI-компаньон</p>
              <Sparkles className="w-20 h-20 mx-auto mb-10 text-pink-400 animate-pulse" />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep("setup")}
              className="px-12 py-6 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-2xl font-bold shadow-2xl shadow-pink-500/50 border border-pink-400/50"
            >
              Начать
            </motion.button>
          </motion.div>
        )}

        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-h-screen p-6 flex flex-col"
          >
            <h2 className="text-4xl font-bold text-center mb-10">Настрой свою AI-подругу</h2>

            {/* Gender */}
            {!personality.gender && (
              <div className="space-y-6">
                <p className="text-center text-lg opacity-80">Кто будет с тобой?</p>
                <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
                  {["Мужчина", "Женщина", "Нейтральный"].map((g) => (
                    <motion.button
                      key={g}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPersonality((p) => ({ ...p, gender: g }))}
                      className={`p-8 rounded-2xl backdrop-blur-xl border-2 transition-all
                        ${g === "Мужчина" ? "border-cyan-400 bg-cyan-900/20" : ""}
                        ${g === "Женщина" ? "border-pink-400 bg-pink-900/20" : ""}
                        ${g === "Нейтральный" ? "border-purple-400 bg-purple-900/20" : ""}
                      `}
                    >
                      <div className="text-6xl mb-4">
                        {g === "Мужчина" && "♂"}
                        {g === "Женщина" && "♀"}
                        {g === "Нейтральный" && "⚪"}
                      </div>
                      <div className="text-2xl font-bold">{g}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Orientation */}
            {personality.gender && !personality.orientation && (
              <div className="space-y-6">
                <p className="text-center text-lg opacity-80">Ориентация</p>
                <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
                  {["Гетеро", "Би", "Гей/Лесби", "Мне всё равно"].map((o) => (
                    <motion.button
                      key={o}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPersonality((p) => ({ ...p, orientation: o }))}
                      className="px-8 py-4 rounded-full bg-white/10 backdrop-blur border border-white/20"
                    >
                      {o === "Гетеро" && "Гетеро"}
                      {o === "Би" && "Би"}
                      {o === "Гей/Лесби" && "Гей/Лесби"}
                      {o === "Мне всё равно" && "Всё равно"}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode */}
            {personality.orientation && !personality.mode && (
              <div className="space-y-10">
                <p className="text-center text-2xl">Как общаемся?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setPersonality((p) => ({ ...p, mode: "friend" }))}
                    className="p-10 rounded-3xl backdrop-blur-xl border-4 border-cyan-400 bg-cyan-900/30 cursor-pointer"
                  >
                    <MessageCircle className="w-20 h-20 mx-auto mb-4 text-cyan-300" />
                    <h3 className="text-3xl font-bold">Дружеский</h3>
                    <p className="mt-4 opacity-80">Поддержка, юмор, забота</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setPersonality((p) => ({ ...p, mode: "flirt" }))}
                    className="p-10 rounded-3xl backdrop-blur-xl border-4 border-pink-400 bg-pink-900/40 cursor-pointer"
                  >
                    <Heart className="w-20 h-20 mx-auto mb-4 text-pink-300 animate-pulse" />
                    <h3 className="text-3xl font-bold">Флирт</h3>
                    <p className="mt-4 opacity-80">Игра, тепло, дразнилки</p>
                  </motion.div>
                </div>

                {personality.mode === "flirt" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto mt-10"
                  >
                    <p className="text-center mb-4">Интенсивность флирта</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={personality.intensity}
                      onChange={(e) => setPersonality((p) => ({ ...p, intensity: +e.target.value }))}
                      className="w-full h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full appearance-none slider"
                      style={{
                        background: `linear-gradient(to right, #ec4899 0%, #a855f7 ${personality.intensity}%, #1f2937 ${personality.intensity}%, #1f2937 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-sm mt-2">
                      <span>Легко</span>
                      <span className="text-pink-400 font-bold">{personality.intensity}%</span>
                      <span>Очень горячо</span>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep("chat")}
                  className="mx-auto block px-12 py-6 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-2xl font-bold shadow-2xl shadow-pink-500/50"
                >
                  Готово
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* Main Chat */}
        {step === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
            <div className="p-6 text-center">
              <h2 className="text-3xl font-bold">
                {personality.mode === "flirt" ? "Твоя AI-подруга" : "Твой AI-друг"}
              </h2>
              <p className="opacity-70">
                {personality.gender} • {personality.mode === "flirt" ? `Флирт ${personality.intensity}%` : "Дружба"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-32">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-6 py-4 rounded-3xl backdrop-blur-xl ${
                      m.role === "user"
                        ? "bg-white/20 border border-white/30"
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

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="max-w-4xl mx-auto flex gap-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Напиши что-нибудь..."
                  className="flex-1 px-6 py-5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-lg focus:outline-none focus:border-pink-400 transition"
                />
                <button
                  onClick={sendMessage}
                  className="p-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
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
