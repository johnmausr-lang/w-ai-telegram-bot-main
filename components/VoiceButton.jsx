"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function VoiceButton({ onResult }) {
  const [listening, setListening] = useState(false);

  function start() {
    if (!("webkitSpeechRecognition" in window)) return;

    const rec = new window.webkitSpeechRecognition();
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.start();
    setListening(true);

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
      setListening(false);
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
  }

  return (
    <motion.button
      onClick={start}
      animate={{
        scale: listening ? [1, 1.15, 1] : 1,
        boxShadow: listening
          ? "0 0 15px rgba(255,46,166,0.8)"
          : "0 0 0px transparent",
      }}
      transition={{ repeat: listening ? Infinity : 0, duration: 1 }}
      className="px-4 py-3 bg-pink-500 rounded-xl font-bold text-lg"
    >
      🎤
    </motion.button>
  );
}
