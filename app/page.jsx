"use client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  // ========== ВСЁ ОСТАЛЬНОЕ КАК В ТВОЁМ CODE ===============

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

  useEffect(() => {
    const saved = loadChat();
    if (saved.length > 0) setChat(saved);
  }, []);

  useEffect(() => {
    saveChat(chat);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

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
        body: JSON.stringify({ message: current, personality }),
      });

      const data = await res.json();
      const reply = data.reply ?? "…";

      const aiEntry = { role: "assistant", content: reply };
      setChat((prev) => [...prev, aiEntry]);

      const detected = detectEmotion(reply);
      setEmotion(detected);

      setRelationshipLevel((r) => Math.min(4, r + 1));

      playTTS(reply);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Упс… ошибка. Но я рядом ❤️" },
      ]);
    }

    setLoading(false);
  }

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

  async function generateImage() {
    setImgLoading(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "neon holographic portrait girl futuristic 2025 aesthetic",
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

  return (
    <div className="relative w-full min-h-screen bg-black text-white">

      <ParallaxBg />

      <Onboarding
        visible={onboardingVisible}
        setPersonality={setPersonality}
        onComplete={() => setOnboardingVisible(false)}
      />

      {!onboardingVisible && (
        <motion.div
          className="relative z-20 w-full max-w-2xl mx-auto bg-white/10
                     backdrop-blur-2xl p-6 mt-14 mb-24 border border-white/10
                     rounded-3xl shadow-2xl"
        >

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Neon Glow AI</h1>
              <p className="text-white/60">Твой AI-компаньон</p>
            </div>

            <AiAvatar emotion={emotion} />
          </div>

          <RelationshipBar level={relationshipLevel} />

          {/* CHAT, IMAGE, SETTINGS logic */}
          {/* Все блоки остаются как в версии 2.0 */}

        </motion.div>
      )}

      {!onboardingVisible && (
        <BottomBar active={activeTab} setActive={setActiveTab} />
      )}
    </div>
  );
}
