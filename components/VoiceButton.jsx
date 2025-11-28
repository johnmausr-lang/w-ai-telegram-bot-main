"use client";

import { motion } from "framer-motion";

export default function VoiceButton({ onResult }) {
  const start = async () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Ваш браузер не поддерживает голосовой ввод");
      return;
    }

    const rec = new webkitSpeechRecognition();
    rec.lang = "ru-RU";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };

    rec.start();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={start}
      style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        background: "var(--primary)",
        color: "white",
        fontSize: 28,
      }}
      className="neon-animated"
    >
      🎤
    </motion.button>
  );
}
