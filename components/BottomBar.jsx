"use client";

import { motion } from "framer-motion";
import { Home, MessageCircle, User, Camera, Settings } from "lucide-react";

export default function BottomBar({ active, setActive }) {
  const items = [
    { id: "home", icon: <Home size={22} /> },
    { id: "chat", icon: <MessageCircle size={22} /> },
    { id: "persona", icon: <User size={22} /> },
    { id: "camera", icon: <Camera size={22} /> },
    { id: "settings", icon: <Settings size={22} /> },
  ];

  return (
    <motion.div
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 
                 flex items-center gap-5 bg-white/10
                 backdrop-blur-xl rounded-3xl px-6 py-3 border border-white/20 shadow-xl z-50"
    >
      {items.map((item) => (
        <motion.button
          key={item.id}
          onClick={() => setActive(item.id)}
          whileTap={{ scale: 0.85 }}
          className={`p-3 rounded-full ${
            active === item.id ? "bg-white/20 text-white" : "text-white/60"
          }`}
        >
          {item.icon}
        </motion.button>
      ))}
    </motion.div>
  );
}
