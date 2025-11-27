"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ParallaxBg from "@/components/ParallaxBg";
import AiAvatar from "@/components/AiAvatar";
import Onboarding from "@/components/Onboarding";
import { detectEmotion } from "@/lib/emotionDetector";

export default function Page() {
  const [onboardingVisible, setOnboardingVisible] = useState(true);

  const [personality, setPersonality] = useState({
    gender: "Женщина",
    mode: "flirt",
    nsfw: true,
  });

  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);

  const [emotion, setEmotion] = useState("neutral");

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // =====================
  // SEND MESSAGE TO AI
  // =====================
  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userEntry = { role: "user", content: message };
    setChat((prev) => [...prev, userEntry]);

    const msg = message;
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, personality }),
      });

      const data = await res.json();
      const reply = data.reply ?? "…";

      const aiEntry = { role: "assistant", content: reply };
      setChat((prev) => [...prev, aiEntry]);

      // Emotion detector
      setEmotion(detectEmotion(reply));

      // Play TTS
      playTTS(reply);

    } catch (err) {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Что-то пошло не так… но я рядом ❤️",
        },
      ]);
    }

    setLoading(false);
  }

  // =====================
  // TTS (VOICE)
  // =====================
  async function playTTS(text) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch {}
  }

  // =====================
  // IMAGE GENERATION
  // =====================
  async function generateImage() {
    if (imgLoading) return;

    setImgLoading(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "portrait neon girl 2025 holographic aesthetic",
          personality,
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

  // =====================
  // RENDER UI
  // =====================
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden text-white flex items-center justify-center">

      {/* 3D Parallax background */}
      <ParallaxBg />

      {/* ONBOARDING */}
      <Onboarding
        visible={onboardingVisible}
        setPersonality={setPersonality}
        onComplete={() => setOnboardingVisible(false)}
      />

      {/* MAIN APP */}
      {!onboardingVisible && (
        <motion.div
          className="relative z-10 w-full max-w-2xl mx-auto backdrop-blur-2xl 
                     bg-white/10 border border-white/10 rounded-3xl shadow-2xl 
                     p-6 mt-10 mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {/* HEADER + AVATAR */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold drop-shadow-lg">Neon Glow AI</h1>
              <p className="text-white/60 text-sm">Твой AI-компаньон</p>
            </div>

            <AiAvatar emotion={emotion} />
          </div>

          {/* CHAT WINDOW */}
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
                        ? "bg-pink-500 text-black font-semibold shadow-xl"
                        : "bg-white/10 border border-white/10 shadow-xl"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* MESSAGE INPUT */}
          <div className="flex gap-3">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl outline-none text-sm placeholder-white/40"
              placeholder="Напиши что-нибудь…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={sendMessage}
              className="px-6 py-3 bg-pink-600 rounded-2xl shadow-xl font-semibold"
            >
              {loading ? "..." : "✦"}
            </motion.button>
          </div>

          {/* IMAGE GENERATOR */}
          <div className="flex flex-col items-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={generateImage}
              className="px-6 py-3 bg-purple-600 rounded-2xl shadow-xl font-medium"
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
        </motion.div>
      )}
    </div>
  );
}
