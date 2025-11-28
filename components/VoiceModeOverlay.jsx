// components/VoiceModeOverlay.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import AiAvatar3D from "@/components/AiAvatar3D";

export default function VoiceModeOverlay({ onExit }) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const rec = new window.webkitSpeechRecognition();
    rec.lang = "ru-RU";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      const result = Array.from(e.results)
        .map(r => r[0].transcript)
        .join("");
      setTranscript(result);
    };

    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;

    return () => rec.stop();
  }, []);

  const sendVoice = async () => {
    if (!transcript.trim()) return;
    setIsListening(false);
    setSpeaking(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: transcript, personality: { mode: "immersive" } }),
    });
    const { reply } = await res.json();

    const audioRes = await fetch("/api/speech", {
      method: "POST",
      body: JSON.stringify({ text: reply }),
    });
    const audio = new Audio(URL.createObjectURL(await audioRes.blob()));
    audio.play();
    setSpeaking(false);
    setTranscript("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onExit}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="relative w-full max-w-4xl p-12"
        onClick={e => e.stopPropagation()}
      >
        <AiAvatar3D emotion="soft" speaking={speaking || isListening} />

        <motion.div className="mt-12 text-center">
          <motion.div
            animate={{ scale: isListening ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
            className="inline-block p-8 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20"
          >
            {isListening ? "Слушаю тебя…" : "Говори"}
          </motion.div>

          {transcript && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-3xl font-light max-w-2xl mx-auto"
            >
              {transcript}
            </motion.p>
          )}

          <button
            onClick={sendVoice}
            disabled={!transcript}
            className="mt-8 px-12 py-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-2xl font-bold disabled:opacity-50"
          >
            Отправить
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
