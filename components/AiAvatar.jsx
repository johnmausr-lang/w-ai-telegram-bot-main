"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";

export default function AiAvatar({ emotion = "neutral" }) {
  const emotionGlow = useMemo(() => {
    switch (emotion) {
      case "happy":
        return "0 0 25px rgba(255, 230, 95, 0.8)";
      case "soft":
        return "0 0 25px rgba(255, 46, 166, 0.8)";
      case "sad":
        return "0 0 25px rgba(70, 130, 255, 0.8)";
      case "angry":
        return "0 0 25px rgba(255, 80, 80, 0.8)";
      default:
        return "0 0 20px rgba(255, 255, 255, 0.25)";
    }
  }, [emotion]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        width: 78,
        height: 78,
        position: "relative",
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow: emotionGlow,
      }}
    >
      {/* Анимация дыхания */}
      <motion.div
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Image
          src="/avatar-default.png"
          alt="AI Avatar"
          width={200}
          height={200}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </motion.div>

      {/* Легкое свечение вокруг */}
      <motion.div
        animate={{
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: emotionGlow,
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
