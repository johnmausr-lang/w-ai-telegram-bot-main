"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Send, Camera, Menu, ArrowLeft } from "lucide-react";

const styles = ["Нежный", "Дерзкий", "Романтичный", "Доминантный", "Игривый"];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState("welcome"); // welcome → gender → style → chat
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
    if (saved) setGeneratedImages(JSON.parse(saved));
  }, []);

  const startChat = () => {
    const title = `${gender === "Парень" ? style : style + "ая"};
    setMessages([{
      text: `Привет, милый Я твой ${gender.toLowerCase()} — ${title.toLowerCase()}. Готов к приключениям?`,
      isBot: true
    }]);
    setStage("chat");
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput("");

    const lower = input.toLowerCase();
    if (lower.includes("фото") || lower.includes("покажи") || lower.includes("сфоткай")) {
      setIsTyping(true);
      setTimeout(() => {
        const img = "https://source.unsplash.com/random/800x1200/?girl,sexy,lingerie,neon,night";
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
      }, 1500);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "Ох, как ты меня заводишь… Продолжай",
          isBot: true
        }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-20 h-20 border-4 border-pink-500 rounded-full animate-spin"></div></div>;

  return (
    <>
      {/* WELCOME SCREEN */}
      <AnimatePresence mode="wait">
        {stage === "welcome" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity={0} className="min-h-screen flex flex-col items-center justify-center px-6">
            <motion.h1 className="text-6xl font-bold text-glow mb-4" initial={{ y: -50 }} animate={{ y: 0 }}>
              Neon Desire
            </motion.h1>
            <p className="text-xl text-gray-400 mb-12">Твой личный 18+ спутник</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage("gender")}
              className="px-12 py-6 bg-gradient-to-r from-pink-600 to-purple-700 rounded-2xl text-2xl font-medium glow-pink"
            >
              Начать
            </motion.button>
          </motion.div>
        )}

        {/* GENDER SELECT */}
        {stage === "gender" && (
          <motion.div initial={{ x: 300 }} animate={{ x: 0 }} className="min-h-screen flex flex-col items-center justify-center px-6">
            <button onClick={() => setStage("welcome")} className="absolute top-8 left-8">
              <ArrowLeft className="w-8 h-8" />
            </button>
            <h2 className="text-4xl font-bold mb-12">Кто твой спутник?</h2>
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              <button onClick={() => { setGender("Девушка"); setStage("style"); }} className="p-8 glass rounded-3xl text-2xl hover:scale-105 transition glow-pink">
                Девушка
              </button>
              <button onClick={() => { setGender("Парень"); setStage("style"); }} className="p-8 glass rounded-3xl text-2xl hover:scale-105 transition glow-cyan">
                Парень
              </button>
            </div>
          </motion.div>
        )}

        {/* STYLE SELECT */}
        {stage === "style" && (
          <motion.div initial={{ x: 300 }} animate={{ x: 0 }} className="min-h-screen flex flex-col justify-center px-6">
            <button onClick={() => setStage("gender")} className="absolute top-8 left-8">
              <ArrowLeft className="w-8 h-8" />
            </button>
            <h2 className="text-4xl font-bold mb-12 text-center">
              Какой стиль общения? {gender}
            </h2>
            <div className="space-y-4 max-w-lg mx-auto w-full">
              {styles.map(s => (
                <button
                  key={s}
                  onClick={() => { setStyle(s); startChat(); }}
                  className="w-full p-6 glass rounded-2xl text-xl hover:scale-105 transition glow-pink"
                >
                  {s}{gender === "Девушка" ? "ая" : (gender === "Парень" ? "ий" : "")}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* CHAT SCREEN */}
        {stage === "chat" && (
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="glass p-5 flex items-center justify-between border-b border-white/10">
              <button onClick={() => setStage("welcome")}>
                <Menu className="w-7 h-7" />
              </button>
              <div className="text-center">
                <p className="font-bold text-xl">{gender} • {style}</p>
              </div>
              <button onClick={() => setShowGallery(true)}>
                <Camera className="w-7 h-7" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={m.isBot ? "flex justify-start" : "flex justify-end"}
                >
                  <div className={`max-w-xs ${m.isBot ? "bg-purple-900/50" : "bg-pink-600/70"} glass rounded-3xl px-5 py-3`}>
                    {m.image && <img src={m.image} className="w-full rounded-2xl mb-2" />}
                    <p className="text-lg">{m.text}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-purple-900/50 glass rounded-3xl px-5 py-3">
                    <span className="animate-pulse">Печатает...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="fixed bottom-6 left-6 right-6">
              <div className="glass rounded-3xl p-4 flex items-center gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши что угодно..."
                  className="flex-1 bg-transparent outline-none text-lg"
                />
                <button onClick={sendMessage} className="p-3 bg-gradient-to-r from-pink-600 to-purple-700 rounded-2xl glow-pink">
                  <Send className="w-6 h-6" />
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
            onClick={() => setShowGallery(false)}
            className="fixed inset-0 bg-black/90 z-50 flex items-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={e => e.stopPropagation()}
              className="w-full bg-gradient-to-t from-black to-transparent rounded-t-3xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Галерея</h2>
                <button onClick={() => setShowGallery(false)}>Close</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.length === 0 ? (
                  <p className="col-span-2 text-center text-gray-500 py-20">Пока пусто...</p>
                ) : (
                  generatedImages.map((src, i) => (
                    <img key={i} src={src} className="w-full rounded-2xl" />
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
