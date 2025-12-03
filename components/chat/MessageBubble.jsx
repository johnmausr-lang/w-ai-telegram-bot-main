// components/chat/MessageBubble.jsx
import { motion } from "framer-motion";

export default function MessageBubble({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-3xl px-5 py-3 shadow-2xl text-white ${
          message.role === "user"
            ? "bg-gradient-to-l from-purple-700 to-pink-700"
            : "bg-gradient-to-r from-pink-700 to-purple-700"
        }`}
      >
        {message.type === "image" ? (
          <img
            src={message.content}
            alt="18+"
            className="rounded-2xl w-full max-w-xs sm:max-w-sm mx-auto border-4 border-purple-500/60 shadow-2xl"
            loading="lazy"
          />
        ) : (
          <p className="text-base sm:text-lg leading-relaxed">
            {message.content || "..."}
          </p>
        )}
      </div>
    </motion.div>
  );
}
