"use client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

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
  // THEMES
  const [theme, setTheme] = useState("neonPink");
  const activeTheme = themes[theme];

  // UI
  const [activeTab, setActiveTab] = useState("chat");
  const [onboardingVisible, setOnboardingVisible] = useState(true);

  // CHARACTER
  const [personality, setPersonality] = useState({
    gender: "Женщина",
    mode: "gentle",
    theme: "neonPink",
  });

  // CHAT
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // RELATIONSHIP
  const [relationshipLevel, setRelationshipLevel] = useState(0);

  // EMOTION
  const [emotion, setEmotion] = useState("neutral");

  // IMAGE GEN
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);

  const endRef = useRef(null);

  // LOAD CHAT FROM STORAGE
  useEffect(() => {
    const saved = loadChat();
    if (saved.length > 0) setChat(saved);
  }, []);

  // SAVE CHAT
  useEffect(() => {
    saveChat(chat);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // SEND MESSAGE
  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userEntry = { role: "user", content: message };
    setChat((prev) => [...prev, userEntry]);

    const currentMsg = message;
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMsg,
          personality,
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? "…";

      const aiEntry = { role: "assistant", content: reply };
      setChat((p) => [...p, aiEntry]);

      const e = detectEmotion(reply);
      setEmotion(e);

      setRelationshipLevel((r) => Math.min(4, r + 1));

      playTTS(reply);
    } catch {
      setChat((p) => [
        ...p,
        {
          role: "assistant",
          content: "Произошла ошибка… но я рядом 💛",
        },
      ]);
    }

    setLoading(false);
  }

  // TTS
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

  // IMG
  async function generateImage() {
    setImgLoading(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `futuristic neon portrait holographic ${personality.gender}`,
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
    <div
      className="relative w-full min-h-screen"
      style={{
        background: "#000",
        color: "#fff",
      }}
    >
      <ParallaxBg />

      <Onboarding
        visible={onboardingVisible}
        onComplete={() => {
          setOnboardingVisible(false);
          setTheme(personality.theme);
        }}
        setPersonality={setPersonality}
      />

      {!onboardingVisible && (
        <motion.div
          className="relative z-20 w-full max-w-2xl mx-auto bg-white/10 
                     backdrop-blur-2xl p-6 mt-14 mb-24 border border-white/10
                     rounded-3xl shadow-2xl"
          style={{
            boxShadow: `0 0 25px ${activeTheme.glow}`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3- font-bold">Neon Glow AI</h1>
              <p className="text-white/60">Персональный AI-компаньон</p>
            </div>

            <AiAvatar emotion={emotion} />
          </div>

          <RelationshipBar level={relationshipLevel} />

          {/* CHAT */}
          {activeTab === "chat" && (
            <div>
              <div
                style={{
                  maxHeight: "420px",
                  overflowY: "auto",
                  paddingRight: 4,
                }}
              >
                {chat.map((msg, i) => (
                  <div key={i} className="mb-3">
                    <div
                      style={{
                        textAlign: msg.role === "user" ? "right" : "left",
                      }}
                    >
                      <span
                        className="inline-block px-4 py-2 rounded-xl blur-glass"
                        style={{
                          background:
                            msg.role === "user"
                              ? activeTheme.glow
                              : "rgba(255,255,255,0.08)",
                          color: "#fff",
                        }}
                      >
                        {msg.content}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={endRef}></div>
              </div>

              {/* INPUT */}
              <div className="flex gap-3 mt-4">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Напиши что-нибудь…"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10"
                />

                <button
                  onClick={sendMessage}
                  className="px-4 py-3 bg-pink-500 rounded-xl font-bold"
                >
                  ➤
                </button>

                <VoiceButton onResult={(txt) => setMessage(txt)} />
              </div>
            </div>
          )}

          {/* IMAGE MODE */}
          {activeTab === "image" && (
            <div className="text-center">
              {generatedImage && (
                <img
                  src={generatedImage}
                  className="w-full rounded-xl mb-4"
                />
              )}
              {imgLoading && (
                <p className="text-white/60 mb-4">Создание образа…</p>
              )}
              <button
                onClick={generateImage}
                className="w-full py-3 bg-pink-500 rounded-xl font-bold"
              >
                Создать новое изображение
              </button>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-3">Персонализация</h2>

              <div className="space-y-2">
                <p className="text-white/70">Тема</p>

                <div className="flex gap-3">
                  {Object.keys(themes).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t);
                        setPersonality({ ...personality, theme: t });
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10"
                    >
                      {themes[t].name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!onboardingVisible && (
        <BottomBar active={activeTab} setActive={setActiveTab} />
      )}
    </div>
  );
}
