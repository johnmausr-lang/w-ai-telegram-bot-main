// components/WelcomeScreen.jsx
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function WelcomeScreen({ onStart }) {
  return (
    <motion.div
      key="welcome"  // ← ОБЯЗАТЕЛЬНО!
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center flex flex-col items-center justify-center gap-12 px-6"
    >
      <div className="relative">
        <Sparkles className="w-24 h-24 text-pink-500 absolute -top-12 -left-12 animate-pulse" />
        <h1 className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Neon Glow AI
        </h1>
        <p className="text-xl mt-4 text-purple-300">Твой 18+ цифровой спутник</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={onStart}
        className="px-12 py-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-3xl font-bold pulse-glow"
      >
        Начать
      </motion.button>
    </motion.div>
  );
}
