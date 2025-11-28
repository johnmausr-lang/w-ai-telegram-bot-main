"use client";

import { motion } from "framer-motion";

export default function AiAvatar({ emotion = "neutral" }) {
  const glow = {
    neutral: "0 0 20px rgba(255, 46, 166, 0.4)",
    happy: "0 0 28px rgba(255, 200, 80, 0.45)",
    flirty: "0 0 28px rgba(255, 40, 120, 0.6)",
    shy: "0 0 22px rgba(140, 80, 255, 0.55)",
    curious: "0 0 26px rgba(80, 200, 255, 0.55)",
  };

  const scale = {
    neutral: 1,
    happy: 1.05,
    flirty: 1.07,
    shy: 0.96,
    curious: 1.03,
  };

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{
        scale: scale[emotion],
        boxShadow: glow[emotion],
      }}
      transition={{ duration: 0.6 }}
      className="rounded-full overflow-hidden"
      style={{
        width: 120,
        height: 120,
        border: "2px solid rgba(255,255,255,0.2)",
      }}
    >
      <motion.img
        src="/avatar-default.png"
        alt="AI avatar"
        className="w-full h-full object-cover"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
