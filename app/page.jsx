"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const AiAvatar3D = dynamic(() => import("@/components/AiAvatar3D"), { ssr: false });
const ParallaxBg = dynamic(() => import("@/components/ParallaxBg"), { ssr: false });
const VoiceModeOverlay = dynamic(() => import("@/components/VoiceModeOverlay"), { ssr: false });

import OnboardingPro from "@/components/OnboardingPro";
import GlassPanel from "@/components/GlassPanel";
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

  const activeTheme = themes[theme];

  // Загрузка данных
  useEffect(() => {
    const saved = loadData();
    if (saved) {
      setChat(saved.chat || []);
      setTheme(saved.theme || "neonPink");
      setCustomAvatar(saved.avatar || null);
      setOnboarding(false);
    }
  }, []);

  // Адаптивная тема по эмоциям
  useEffect(() => {
    const lastUserMsg = chat.slice().reverse().find(m => m.role === "user")?.content;
    if (lastUserMsg) {
      detectEmotionAdvanced(lastUserMsg).then(setEmotion);
    }
  }, [chat]);

  useEffect(() => {
    if (emotion !== "neutral") {
      setTheme(emotionToTheme[emotion]);
    }
  }, [emotion]);

  // Сохранение
  useEffect(() => {
    saveData({ chat, theme, avatar: customAvatar });
  }, [chat, theme, customAvatar]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setChat(prev => [...prev, userMsg]);
    setInput("");

    setSpeaking(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input, personality: { theme, emotion } }),
    });
    const { reply } = await res.json();
    setChat(prev => [...prev, { role: "assistant", content: reply }]);
    setSpeaking(false);

    // TTS в голосовом режиме
    if (voiceMode) {
      const audioRes = await fetch("/api/speech", {
        method: "POST",
        body: JSON.stringify({ text: reply }),
      });
      const audio = new Audio(URL.createObjectURL(await audioRes.blob()));
      audio.play();
    }
  };

  if (onboarding) {
    return <OnboardingPro onComplete={(data) => {
      setCustomAvatar(data.avatar);
      setTheme(data.theme);
      setOnboarding(false);
    }} />;
  }

  return (
    <>
      <ParallaxBg emotion={emotion} />
      <div className="min-h-screen relative z-10 flex flex-col items-center justify-center p-6">
        <AnimatePresence>
          {voiceMode && <VoiceModeOverlay onExit={() => setVoiceMode(false)} />}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <GlassPanel>
            <div className="p-8 text-center">
              <AiAvatar3D emotion={emotion} speaking={speaking} />
              <h1 className="text-4xl font-bold mt-6" style={{ color: activeTheme.primary }}>
                {emotion === "happy" && "Ты светишься! ☀️"}
                {emotion === "sad" && "Я здесь… обними меня мысленно ♡"}
                {emotion === "soft" && "Ты такая нежная сегодня…"}
              </h1>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {chat.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-2xl ${m.role === "user" ? "bg-white/10 ml-auto max-w-xs" : "bg-white/5 mr-auto max-w-md"}`}
                >
                  {m.content}
                </motion.div>
              ))}
            </div>

            <div className="p-6 flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Напиши мне что угодно..."
                className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 focus:outline-none focus:border-pink-500 transition"
              />
              <button onClick={() => setVoiceMode(true)} className="px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-2xl">
                Voice Mode
              </button>
              <button onClick={send} className="px-6 py-4 bg-white/20 rounded-full">
                Send
              </button>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </>
  );
}
