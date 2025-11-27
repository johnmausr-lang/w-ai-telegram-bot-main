"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ParallaxBg from "@/components/ParallaxBg";
import AiAvatar from "@/components/AiAvatar";
import Onboarding from "@/components/Onboarding";
import BottomBar from "@/components/BottomBar";
import VoiceButton from "@/components/VoiceButton";
import RelationshipBar from "@/components/RelationshipBar";

import { detectEmotion } from "@/lib/emotionDetector";
import { saveChat, loadChat } from "@/lib/chatStorage";

import { themes } from "@/app/themes";

export default function Page() {
  // ===========================
  // SYSTEM STATES
  // ===========================
  const [theme, setTheme] = useState("neonPink");
  const activeTheme = themes[theme];

  const [activeTab, setActiveTab] = useState("chat");

  const [onboardingVisible, setOnboardingVisible] = useState(true);

  const [personality, setPersonality] = useState({
    gender: "Женщина",
    mode: "flirt",
    nsfw: true,
  });

  const [chat, setChat] = useState([]);
  const [relationshipLevel, setRelationshipLevel] = useState(0);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [emotion, setEmotion] = useState("neutral");

  const [generatedImage, setGeneratedImage] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);

  const endRef = useRef(null);

  // ===========================
  // INIT — LOAD HISTORY
  // ===========================
  useEffect(() => {
    const saved = loadChat();
    if (saved.length > 0) setChat(saved);
  }, []);

  useEffect(() => {
    saveChat(chat);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ===========================
  // SEND MESSAGE
  // ===========================
  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userEntry = { role: "user", content: message };
    setChat((prev) => [...prev, userEntry]);

    const current = message;
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: current,
          personality,
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? "…";

      const aiEntry = { role: "assistant", content: reply };
      setChat((prev) => [...prev, aiEntry]);

      // Emotion
      const detected = detectEmotion(reply);
      setEmotion(detected);

      // Relationship level
      setRelationshipLevel((r) => Math.min(4, r + 1));

      // TTS output
      playTTS(reply);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Упс… ошибка. Но я рядом ❤️" },
      ]);
    }

    setLoading(false);
  }

  // ===========================
  // TTS
  // ===========================
  async function playTTS(text) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const buf = await res.arrayBuffer();
      const audio = new Audio(URL.createObjectURL(new Blob([buf])));
      audio.play();
    } catch {}
  }

  // ===========================
  // IMAGE GENERATION
  // ===========================
  async function generateImage() {
    setImgLoading(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personality,
          prompt: "neon holographic portrait girl futuristic 2025 aesthetic",
        }),
      });

      const data = await res.json();
      if (data.image) {
        setGeneratedImage(`data:image/png;base64,${data.image}`);
      }
    } finally {
      setImgLoading(false);
    }
  }

  // ===========================
  // UI
  // ===========================
  return (
    <div
      className="relative w-full min-h-screen overflow-hidden text-white flex items-center justify-center"
      style={{
        "--primary": activeTheme.primary,
        "--glow": activeTheme.glow,
      }}
    >
      {/* 3D Background */}
      <ParallaxBg />

      {/* Onboarding */}
      <Onboarding
        visible={onboardingVisible}
        setPersonality={setPersonality}
        onComplete={() => setOnboardingVisible(false)}
      />

      {/* MAIN UI */}
      {!onboardingVisible && (
        <motion.div
          className="relative z-20 w-full max-w-2xl mx-auto 
                     backdrop-blur-2xl bg-white/10 
                     border border-white/10 rounded-3xl shadow-2xl
                     p-6 pt-8 mt-14 mb-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Neon Glow AI</h1>
              <p className="text-white/60">Твой AI-компаньон</p>
            </div>

            {/* AVATAR */}
            <AiAvatar emotion={emotion} />
          </div>

          {/* RELATIONSHIP BAR */}
          <RelationshipBar level={relationshipLevel} />

          {/* CHAT */}
          {activeTab === "chat" && (
            <>
              <div
                className="h-[55vh] overflow-y-auto pr-2 space-y-4 mb-4 
                           bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <AnimatePresence>
                  {chat.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                      exit={{ opacity: 0 }}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-3 max-w-[80%] rounded-2xl text-sm tracking-wide backdrop-blur-xl ${
                          msg.role === "user"
                            ? "bg-[var(--primary)] text-black font-semibold shadow-xl"
                            : "bg-white/10 border border-white/10 shadow-xl"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={endRef}></div>
              </div>

              {/* INPUT */}
              <div className="flex gap-3 items-center">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-xl 
                             border border-white/20 rounded-2xl outline-none
                             text-sm placeholder-white/40"
                  placeholder="Напиши что-нибудь…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={sendMessage}
                  className="px-6 py-3 bg-[var(--primary)] rounded-2xl shadow-xl font-semibold"
                >
                  {loading ? "..." : "✦"}
                </motion.button>

                <VoiceButton />
              </div>
            </>
          )}

          {/* CAMERA / IMAGE */}
          {activeTab === "camera" && (
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={generateImage}
                className="px-6 py-3 bg-purple-600 rounded-2xl shadow-xl font-medium mt-4"
              >
                {imgLoading ? "Генерация…" : "Создать образ"}
              </motion.button>

              {generatedImage && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={generatedImage}
                  className="w-full mt-6 rounded-3xl shadow-2xl border border-white/10"
                />
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Темы</h2>

              <div className="flex gap-4">
                {Object.entries(themes).map(([key, t]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setTheme(key)}
                    className="px-4 py-2 rounded-xl text-white border border-white/20"
                    style={{
                      background:
                        theme === key ? t.primary : "rgba(255,255,255,0.05)",
                    }}
                  >
                    {t.name}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* BOTTOM NAV BAR */}
      {!onboardingVisible && (
        <BottomBar active={activeTab} setActive={setActiveTab} />
      )}
    </div>
  );
}
