"use client";
import { motion } from "framer-motion";
import { useLottie } from "lottie-react";
import calmAnimation from "@/public/lottie/calm.json";
import playfulAnimation from "@/public/lottie/playful.json";
import arousedAnimation from "@/public/lottie/aroused.json";

export default function LiveAvatar({ gender = "Девушка", nsfwLevel = 50 }) {
  const getAnimation = () => {
    if (nsfwLevel >= 80) return arousedAnimation;
    if (nsfwLevel >= 50) return playfulAnimation;
    return calmAnimation;
  };

  const { View } = useLottie({
    animationData: getAnimation(),
    loop: true,
    autoplay: true,
    style: { width: 80, height: 80 },
  });

  return (
    <motion.div
      animate={{ scale: nsfwLevel > 80 ? [1, 1.05, 1] : 1 }}
      transition={{ repeat: Infinity, duration: 4 }}
      className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF47A3]/50 glow-pink"
    >
      {View}
    </motion.div>
  );
}
