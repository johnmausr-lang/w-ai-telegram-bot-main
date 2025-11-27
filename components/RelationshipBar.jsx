"use client";

import { motion } from "framer-motion";

export default function RelationshipBar({ level = 0 }) {
  const labels = ["Дистанция", "Интерес", "Игра", "Химия", "Близость"];

  return (
    <div className="my-4">
      <p className="text-white/60 text-sm mb-1">Связь: {labels[level]}</p>

      <div className="w-full h-3 bg-white/10 rounded-xl overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(level + 1) * 20}%` }}
          transition={{ duration: 1 }}
          className="h-full bg-pink-500 shadow-lg"
        />
      </div>
    </div>
  );
}
