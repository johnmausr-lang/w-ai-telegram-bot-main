"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function VoiceButton({ onResult }) {
  const [recording, setRecording] = useState(false);

  function startRecording() {
    setRecording(true);
    // позже добавим запись
  }

  function stopRecording() {
    setRecording(false);
    // позже добавим отправку на /api/stt
  }

  return (
    <motion.button
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      className="relative w-14 h-14 rounded-full bg-red-600 shadow-xl"
    >
      {recording && (
        <motion.div
          className="absolute inset-0 rounded-full bg-red-500"
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
