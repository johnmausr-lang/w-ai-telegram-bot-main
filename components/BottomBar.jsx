"use client";

import { motion } from "framer-motion";

export default function BottomBar({ active, setActive }) {
  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 
                 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl 
                 border border-white/15 flex gap-8 items-center"
    >
      {[
        { id: "chat", icon: "💬" },
        { id: "image", icon: "🌌" },
        { id: "settings", icon: "⚙️" },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`text-2xl transition ${
            active === item.id ? "opacity-100" : "opacity-40"
          }`}
        >
          {item.icon}
        </button>
      ))}
    </motion.div>
  );
}
