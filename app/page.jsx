// app/page.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import OnboardingPro from "@/components/OnboardingPro";
import GlassPanel from "@/components/GlassPanel";
import { themes } from "@/app/themes";

export default function Page() {
  const [onboarding, setOnboarding] = useState(true);
  const [theme, setTheme] = useState("neonPink");
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customAvatar, setCustomAvatar] = useState("/avatar-default.png");

  const currentTheme = themes[theme] || themes.neonPink;

  useEffect(() => {
    const saved = localStorage.getItem("neon_glow_2025");
    if (saved) {
      const data = JSON.parse(saved);
      setChat(data.chat || []);
      setTheme(data.theme || "neonPink");
      setCustomAvatar(data.avatar || "/avatar-default.png");
      setOnboarding(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("neon_glow_2025", JSON.stringify({ chat, theme, avatar: customAvatar }));
  }, [chat, theme, customAvatar]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setChat(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, personality: { gender: "Женщина", mode: "gentle" } }),
      });
      const { reply } = await res.json();
      setChat(prev => [...prev, { role: "assistant", content: reply || "Я здесь ♡" }]);
    } catch {
      setChat(prev => [...prev, { role: "assistant", content: "Связь прервалась... попробуй ещё раз" }]);
    }
    setLoading(false);
  };

  if (onboarding) {
    return <OnboardingPro onComplete={(data) => {
      setCustomAvatar(data.avatar || "/avatar-default.png");
      setTheme(data.theme);
      setOnboarding(false);
    }} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: `radial-gradient(circle at 50% 50%, ${currentTheme.glow} 0%, black 70%)`,
    }}>
      {/* Неоновый фон */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
          <GlassPanel>
            {/* Аватар */}
            <div className="flex justify-center -mt-16 mb-4">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl"
                style={{ boxShadow: `0 0 40px ${currentTheme.glow}` }}
              >
                <Image src={customAvatar} alt="AI" fill className="object-cover" />
              </motion.div>
            </div>

            <h1 className="text-4xl font-bold text-center mb-8" style={{ color: currentTheme.primary }}>
              Neon Glow AI
            </h1>

            {/* Чат */}
            <div className="h-96 overflow-y-auto mb-6 space-y-4 px-2">
              {chat.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs px-5 py-3 rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-white/20 text-white" 
                      : "bg-white/10 text-white/90"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && <div className="text-center text-white/60">Печатает...</div>}
            </div>

            {/* Инпут */}
            <div className="flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Напиши мне..."
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:border-pink-500 transition text-white placeholder-white/50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-bold disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
