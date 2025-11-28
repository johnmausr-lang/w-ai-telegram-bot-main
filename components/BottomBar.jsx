"use client";

import { motion } from "framer-motion";

export default function BottomBar({ active, setActive }) {
  const tabs = [
    { id: "chat", label: "Чат", icon: "💬" },
    { id: "image", label: "Образ", icon: "✨" },
    { id: "settings", label: "Профиль", icon: "⚙️" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="blur-glass neon-animated"
        style={{
          display: "flex",
          gap: 20,
          padding: "14px 22px",
          borderRadius: 26,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              color: active === t.id ? "var(--primary)" : "white",
              fontSize: 20,
              transition: "0.2s",
            }}
          >
            {t.icon}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
