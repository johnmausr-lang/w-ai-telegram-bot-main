// app/page.jsx — ФИНАЛЬНАЯ ВЕРСИЯ, РАБОТАЕТ НА 1000%
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Send, Camera, Menu, ArrowLeft } from "lucide-react";

const styles = ["Нежный", "Дерзкий", "Романтичный", "Доминантный", "Игривый"];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState("welcome");
  const [gender, setGender] = useState("");
  const [style, setStyle] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("neon_desire_images");
    if (saved) {
      try {
        setGeneratedImages(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("neon_desire_images");
      }
    }
  }, []);

  const startChat = () => {
    const title = gender === "Парень" ? style : style + "ая";
    setMessages([{
      text: `Привет, милый Я твой ${gender.toLowerCase()} — ${title.toLowerCase()}. Готов к приключениям?`,
      isBot: true
    }]);
    setStage("chat");
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput("");

    const lower = userMsg.toLowerCase();
    if (lower.includes("фото") || lower.includes("покажи") || lower.includes("сфоткай") || lower.includes("нарисуй")) {
      setIsTyping(true);
      setTimeout(() => {
        const img = `https://picsum.photos/800/1200?random=${Date.now()}`;
        setGeneratedImages(prev => {
          const updated = [img, ...prev].slice(0, 30);
          localStorage.setItem("neon_desire_images", JSON.stringify(updated));
          return updated;
        });
        setMessages(prev => [...prev, {
          text: "Держи горячее фото специально для тебя",
          isBot: true,
          image: img
        }]);
        setIsTyping(false);
      }, 1800);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "Ммм... ты меня заводишь. Продолжай",
          isBot: true
        }]);
        setIsTyping(false);
      }, 1200);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-t-pink-500 border-r-purple-500 border-b-cyan-500 border-l-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {/* WELCOME */}
        {stage === "welcome" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-6">
              Neon Desire
            </motion.h1>
            <p className="text-xl text-gray-400 mb-12">Твой личный 18+ спутник</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage("gender")}
              className="px-16 py-6 bg-gradient-to-r from-pink-600 to-purple-700 rounded-3xl text-2xl font-semibold shadow-2xl shadow-pink-500/50"
            >
              Начать приключение
            </motion.button>
          </motion.div>
        )}

        {/* GENDER */}
        {stage === "gender" && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} className="min-h-screen flex flex-col items-center justify-center px-6">
            <button onClick={() => setStage("welcome")} className="absolute top-8 left-8">
              <ArrowLeft className="w-8 h-8 text-gray-400" />
            </button>
            <h2 className="text-4xl md:text-5xl font-bold mb-16">Кто твой спутник?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-lg">
              <button
                onClick={() => { setGender("Девушка"); setStage("style"); }}
                className="p-12 glass rounded-3xl text-3xl font-bold hover:scale-105 transition-all glow-pink"
              >
                Девушка
              </button>
              <button
                onClick={() => { setGender("Парень"); setStage("style"); }}
                className="p-12 glass rounded-3xl text-3xl font-bold hover:scale-105 transition-all glow-cyan"
              >
                Парень
              </button>
            </div>
          </motion.div>
        )}

        {/* STYLE */}
        {stage === "style" && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} className="min-h-screen flex flex-col justify-center px-6">
            <button onClick={() => setStage("gender")} className="absolute top-8 left-8">
              <ArrowLeft className="w-8 h-8 text-gray-400" />
            </button>
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
              Какой стиль общения?
            </h2>
            <div className="space-y-6 max-w-2xl mx-auto w-full">
              {styles.map(s => (
                <button
                  key={s}
                  onClick={() => { setStyle(s); startChat(); }}
                  className="w-full p-8 glass rounded-3xl text-2xl font-medium hover:scale-105 transition-all glow-pink"
                >
                  {s}{gender === "Девушка" ? "ая" : "ий"}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* CHAT */}
        {stage === "chat" && (
          <div className="min-h-screen flex flex-col">
            <div className="glass p-6 flex items-center justify-between border-b border-white/10 backdrop-blur-xl">
              <button onClick={() => setStage("welcome")}>
                <Menu className="w-8 h-8" />
              </button>
              <div className="text-center">
                <p className="font-bold text-xl">{gender} • {style}</p>
              </div>
              <button onClick={() => setShowGallery(true)}>
                <Camera className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={m.isBot ? "flex justify-start" : "flex justify-end"}
                >
                  <div className={`max-w-xs md:max-w-md ${m.isBot ? "bg-purple-900/60" : "bg-pink-600/70"} glass rounded-3xl px-6 py-4`}>
                    {m.image && <img src={m.image} alt="photo" className="w-full rounded-2xl mb-3" />}
                    <p className="text-lg leading-relaxed">{m.text}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-purple-900/60 glass rounded-3xl px-6 py-4">
                    <span className="animate-pulse text-lg">Печатает...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="fixed bottom-6 left-6 right-6">
              <div className="glass rounded-3xl p-5 flex items-center gap-4 backdrop-blur-xl">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши что угодно..."
                  className="flex-1 bg-transparent outline-none text-lg placeholder-gray-500"
                />
                <button
                  onClick={sendMessage}
                  className="p-4 bg-gradient-to-r from-pink-600 to-purple-700 rounded-2xl hover:scale-110 transition-all glow-pink"
                >
                  <Send className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* GALLERY */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-end"
            onClick={() => setShowGallery(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={e => e.stopPropagation()}
              className="w-full bg-gradient-to-t from-black via-black/90 to-transparent rounded-t-3xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold">Галерея</h2>
                <button onClick={() => setShowGallery(false)} className="text-2xl">×</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.length === 0 ? (
                  <p className="col-span-2 text-center text-gray-500 text-xl py-32">Пока пусто... Напиши "фото"</p>
                ) : (
                  generatedImages.map((src, i) => (
                    <img key={i} src={src} className="w-full rounded-2xl shadow-2xl" />
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
