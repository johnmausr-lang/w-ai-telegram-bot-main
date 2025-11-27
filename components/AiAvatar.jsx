"use client";
import { motion } from "framer-motion";

export default function AiAvatar({ emotion = "neutral" }) {
  const emotionGlow = {
    neutral: "shadow-pink-500/30",
    happy: "shadow-pink-400/60",
    flirty: "shadow-red-500/60",
    shy: "shadow-purple-500/50",
    curious: "shadow-blue-500/50",
  };

  const emotionScale = {
    neutral: 1,
    happy: 1.05,
    flirty: 1.07,
    shy: 0.97,
    curious: 1.02,
  };

  const emotionRotate = {
    neutral: 0,
    happy: 2,
    flirty: -3,
    shy: 1,
    curious: -1,
  };

  return (
    <motion.div
      animate={{
        scale: emotionScale[emotion],
        rotate: emotionRotate[emotion],
      }}
      transition={{ type: "spring", stiffness: 60, damping: 12 }}
      className={`
        w-32 h-32 rounded-full overflow-hidden border border-white/20 shadow-2xl 
        ${emotionGlow[emotion]} bg-white/5 backdrop-blur-xl
      `}
    >
      <img
        src="/avatar-default.png"
        className="w-full h-full object-cover"
        alt="AI Avatar"
      />
    </motion.div>
  );
}
