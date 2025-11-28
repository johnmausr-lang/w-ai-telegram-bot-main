"use client";

import { motion } from "framer-motion";

export default function RelationshipBar({ level }) {
  const levels = ["0", "1", "2", "3", "4"];

  return (
    <div className="w-full mt-4 mb-6">
      <div className="text-white/60 mb-1 text-sm">
        Уровень связи: {level}
      </div>

      <div className="flex gap-2">
        {levels.map((l, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8 }}
            animate={{
              scale: i <= level ? 1 : 0.8,
              background: i <= level ? "#ff2ea6" : "rgba(255,255,255,0.2)",
            }}
            className="h-3 flex-1 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
