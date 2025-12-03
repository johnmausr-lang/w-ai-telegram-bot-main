// components/chat/ChatInputBar.jsx — ИСПРАВЛЕННАЯ ВЕРСИЯ (ДЕКАБРЬ 2025)

import { motion, AnimatePresence } from "framer-motion";  // ← ЭТО БЫЛО ПОТЕРЯНО!
import { Heart, MessageCircle, Camera } from "lucide-react";

export default function ChatInputBar({
  input,
  setInput,
  loading,
  generatingPhoto,
  sendMessage,
  generatePhoto,
  showHeart,
}) {
  return (
    <>
      {/* Основная панель ввода */}
      <div className="p-4 flex items-end gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Напиши или нажми камеру..."
          rows={1}
          className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-3.5 text-base outline-none resize-none max-h-32 placeholder-white/50 scrollbar-hide focus:ring-2 focus:ring-purple-500/50 transition-all"
        />

        <button
          onClick={() => setInput((prev) => prev + " ❤️")}
          className="p-3.5 bg-pink-600 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Heart className="w-6 h-6" />
        </button>

        <button
          onClick={sendMessage}
          disabled={loading}
          className="p-3.5 bg-purple-600 rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        <button
          onClick={generatePhoto}
          disabled={generatingPhoto}
          className="p-3.5 bg-red-600 rounded-full shadow-lg relative hover:scale-110 transition-transform"
        >
          <Camera className="w-6 h-6" />
          {generatingPhoto && (
            <div className="absolute inset-0 border-4 border-t-transparent border-white rounded-full animate-spin" />
          )}
        </button>
      </div>

      {/* ЛЕТЯЩЕЕ СЕРДЕЧКО — теперь работает! */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.5 }}
            animate={{ y: -300, opacity: 0, scale: 2.5 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.4,
              ease: "easeOut",
            }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 pointer-events-none z-50"
          >
            <div className="text-8xl animate-pulse drop-shadow-2xl">
              <span className="bg-gradient-to-br from-pink-500 to-purple-500 bg-clip-text text-transparent">
                ❤️
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
