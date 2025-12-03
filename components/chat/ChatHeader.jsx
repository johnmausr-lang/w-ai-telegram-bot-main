// components/chat/ChatHeader.jsx — ИСПРАВЛЕНО
import { motion } from "framer-motion";

const TypingIndicator = () => (
  <motion.div className="flex gap-1">
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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-5 py-4">
        {/* Левая часть */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {aiName[0]}
            </div>
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

        {/* ПРАВИЛЬНАЯ ШКАЛА ЗАГРУЗКИ — В ХЕДЕРЕ! */}
        <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            initial={{ width: "0%" }}
            animate={{ width: "92%" }}
            transition={{ duration: 3, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
