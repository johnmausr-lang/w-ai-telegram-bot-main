"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import ParallaxBg from "@/components/ParallaxBg";
import OnboardingPro from "@/components/OnboardingPro";
import GlassPanel from "@/components/GlassPanel";
import VoiceModeOverlay from "@/components/VoiceModeOverlay"; // Упрощённый, без 3D

import { detectEmotionAdvanced } from "@/lib/emotionEngine";
import { themes, emotionToTheme } from "@/app/themes";
import { loadData, saveData } from "@/lib/storage";

export default function Page() {
  const [onboarding, setOnboarding] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [theme, setTheme] = useState("neonPink");
  const [emotion, setEmotion] = useState("neutral");
  const [speaking, setSpeaking] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [customAvatar, setCustomAvatar] = useState(null);

  const activeTheme = themes[theme] || themes.neonPink;

  // Загрузка
  useEffect(() => {
    const saved = loadData();
    if (saved) {
      setChat(saved.chat || []);
      setTheme(saved.theme || "neonPink");
      setCustomAvatar(saved.avatar || "/avatar-default.png");
      setOnboarding(false);
    }
  }, []);

  // Эмоции → тема
  useEffect(() => {
    const lastMsg = chat[chat.length - 1]?.content;
    if (lastMsg) {
      detectEmotionAdvanced(lastMsg).then(setEmotion);
    }
  }, [chat]);

  useEffect(() => {
    if (emotion !== "neutral") setTheme(emotionToTheme[emotion]);
  }, [emotion]);

  // Сохранение
  useEffect(() => {
    saveData({ chat, theme, avatar: customAvatar });
  }, [chat, theme, customAvatar]);

  const send = async () => {
    if (!input.trim() || speaking) return;
    const userMsg = { role: "user", content: input };
    setChat(prev => [...prev, userMsg]);
    setInput("");
    setSpeaking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, personality: { theme, emotion } }),
      });
      const { reply } = await res.json();
      setChat(prev => [...prev, { role: "assistant", content: reply }]);

      // TTS если voiceMode
      if (voiceMode) {
        const audioRes = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: reply }),
        });
        const audioBlob = await audioRes.blob();
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.play();
      }
    } catch (e) {
      setChat(prev => [...prev, { role: "assistant", content: "Извини, связь прервалась... 😔" }]);
    }
    setSpeaking(false);
  };

  if (onboarding) {
    return <OnboardingPro onComplete={(data) => {
      setCustomAvatar(data.avatar || "/avatar-default.png");
      setTheme(data.theme);
      setOnboarding(false);
    }} />;
  }

  return (
    <>
      <ParallaxBg emotion={emotion} />
      <style jsx global>{`
        body { background: radial-gradient(ellipse at center, ${activeTheme.glow} 0%, black 70%); }
      `}</style>
      <div className="min-h-screen relative z-10 flex flex-col items-center justify-center p-4">
        <AnimatePresence>
          {voiceMode && <VoiceModeOverlay onExit={() => setVoiceMode(false)} />}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <GlassPanel className="p-6">
            {/* 2D Аватар с glow */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                  boxShadow: speaking 
                    ? `0 0 30px ${activeTheme.glow}` 
                    : `0 0 20px ${activeTheme.glow}`,
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/30"
              >
                <Image
                  src={customAvatar}
                  alt="AI Companion"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>

            <h1 className="text-2xl font-bold text-center mb-4" style={{ color: activeTheme.primary }}>
              {emotionToGreeting(emotion)}
            </h1>

            <div className="space-y-3 max-h-64 overflow-y-auto p-2">
              {chat.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-xl max-w-xs ${
                    msg.role === "user" 
                      ? "ml-auto bg-white/20 text-right" 
                      : "mr-auto bg-white/10"
                  }`}
                >
                  {msg.content}
                </motion.div>
              ))}
              {speaking && (
                <div className="mr-auto bg-white/10 p-3 rounded-xl">AI печатает...</div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Расскажи мне что-то..."
                className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:border-pink-400 transition"
                disabled={speaking}
              />
              <button 
                onClick={send} 
                disabled={speaking || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full disabled:opacity-50"
              >
                ➤
              </button>
              <button 
                onClick={() => setVoiceMode(true)}
                className="px-4 py-3 bg-blue-500 rounded-full"
              >
                🎤
              </button>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </>
  );
}

function emotionToGreeting(emotion) {
  const greetings = {
    happy: "Ты сияешь! 🌟",
    sad: "Я здесь, чтобы обнять... 💙",
    soft: "Твои слова трогают сердце ♡",
    angry: "Давай выдохнем вместе... 🔥",
    neutral: "Привет, что новенького?",
  };
  return greetings[emotion] || greetings.neutral;
}
