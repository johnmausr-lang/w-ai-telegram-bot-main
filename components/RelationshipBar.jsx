"use client";

import { motion } from "framer-motion";

export default function RelationshipBar({ level = 0 }) {
  const titles = ["Незнакомцы", "Теплый контакт", "Интерес", "Симпатия", "Близость"];

  return (
    <div className="my-4">
      <p className="text-white/70 mb-2">{titles[level]}</p>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: "var(--primary)" }}
          animate={{ width: `${(level + 1) * 20}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
