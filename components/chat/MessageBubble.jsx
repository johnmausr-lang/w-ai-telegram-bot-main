// components/chat/MessageBubble.jsx — ПОЛНАЯ КРАСОТА
import { motion } from "framer-motion";

export default function MessageBubble({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[85%] rounded-3xl px-5 py-3 shadow-2xl text-white font-medium text-base leading-relaxed ${
          message.role === "user"
            ? "bg-gradient-to-l from-purple-700 to-pink-700"
            : "bg-gradient-to-r from-pink-700 to-purple-700"
        }`}
      >
        {message.type === "image" ? (
          <img
            src={message.content}
            alt="18+"
            className="rounded-2xl w-full max-w-sm mx-auto border-4 border-purple-500/60 shadow-2xl"
            loading="lazy"
          />
        ) : (
          <p>{message.content || "..."}</p>
        )}
      </div>
    </motion.div>
  );
}
