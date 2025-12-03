// components/chat/ChatHeader.jsx
import { motion } from "framer-motion";

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex gap-1"
  >
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
        className="w-2 h-2 bg-pink-400 rounded-full"
      />
    ))}
  </motion.div>
);

export default function ChatHeader({ personality, isTyping }) {
  const aiName = personality.gender === "Парень" ? "Алекс" : "Ника";
  const avatarUrl = personality.gender === "Парень"
    ? "https://i.imgur.com/8Y8k2vX.jpeg"  // можно заменить на своё
    : "https://i.imgur.com/8Y8k2vX.jpeg";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-5 py-4">
        {/* Левая часть — аватар + имя + онлайн */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={aiName}
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow-lg"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg">{aiName}</h3>
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <span>онлайн</span>
              {isTyping && <TypingIndicator />}
            </div>
          </div>
        </div>

        {/* Прогресс-бар (показывает, насколько "разогрет" чат) */}
        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            initial={{ width: "0%" }}
            animate={{ width: "85%" }}  // можно привязать к dirtyLevel
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
