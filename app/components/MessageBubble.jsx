"use client";
import { motion } from "framer-motion";

export default function MessageBubble({ message, onImageClick }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5`}
    >
      <div
        className={`max-w-[85%] rounded-3xl px-5 py-4 ${
          isUser
            ? "bg-gradient-to-r from-[#FF47A3] to-[#CC338F] text-white"
            : "glass border border-white/10"
        }`}
      >
        {message.type === "image" ? (
          <motion.img
            whileTap={{ scale: 0.98 }}
            src={message.content}
            onClick={() => onImageClick(message.content)}
            className="rounded-2xl max-w-full cursor-pointer shadow-2xl"
            loading="lazy"
          />
        ) : (
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}
      </div>
    </motion.div>
  );
}
