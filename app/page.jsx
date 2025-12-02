"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Camera, Menu, X, Heart, Zap } from "lucide-react";

export default function ChromaticEclipse() {
  const [step, setStep] = useState("discovery");
  const [selectedAI, setSelectedAI] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPromptSheet, setShowPromptSheet] = useState(false);
  const [revealedImages, setRevealedImages] = useState(new Set());

  const ais = [
    { id: 1, name: "Луна", status: "Готова к фантазиям", avatar: "/ai/luna.jpg" },
    { id: 2, name: "Нова", status: "Только для тебя", avatar: "/ai/nova.jpg" },
    { id: 3, name: "Эклипс", status: "Секреты ночи", avatar: "/ai/eclipse.jpg" },
  ];

  const toggleReveal = (id) => {
    setRevealedImages(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-eclipse-bg overflow-hidden">
      {/* Discovery Screen */}
      <AnimatePresence mode="wait">
        {step === "discovery" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 pt-12"
          >
            <h1 className="text-4xl font-semibold mb-10 text-center">AI Партнёры</h1>
            <div className="space-y-6">
              {ais.map(ai => (
                <motion.div
                  key={ai.id}
                  layoutId={`ai-${ai.id}`}
                  onClick={() => { setSelectedAI(ai); setStep("chat"); }}
                  className="glass rounded-3xl p-6 cursor-pointer neon-border-pink overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden">
                        <div className={`w-full h-full bg-gray-800 blur-preview ${revealedImages.has(ai.id) ? 'revealed' : ''}`}
                          style={{ backgroundImage: `url(${ai.avatar})`, backgroundSize: 'cover' }}
                          onClick={(e) => { e.stopPropagation(); toggleReveal(ai.id); }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-neon-pink opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-medium">{ai.name}</h3>
                      <p className="text-text-secondary flex items-center gap-2">
                        <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                        {ai.status}
                      </p>
                    </div>
                    <motion.div
                      className="px-6 py-3 bg-gradient-to-r from-neon-pink to-glow-purple rounded-2xl text-white font-medium neon-pulse"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Чат
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat Screen */}
        {step === "chat" && selectedAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-screen"
          >
            {/* Header */}
            <div className="glass border-b border-glass-stroke p-4 flex items-center gap-4">
              <button onClick={() => setStep("discovery")}><ChevronLeft className="w-8 h-8" /></button>
              <div className="w-12 h-12 rounded-xl bg-gray-700" />
              <div>
                <h3 className="font-medium text-lg">{selectedAI.name}</h3>
                <p className="text-sm text-neon-cyan">Онлайн • Готовит ответ...</p>
              </div>
              <div className="ml-auto">
                <Sparkles className="w-6 h-6 text-neon-pink" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs rounded-3xl px-5 py-4 ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-neon-pink to-glow-purple text-white"
                      : "glass neon-border-pink"
                  }`}>
                    {m.type === "image" ? (
                      <img src={m.content} className="rounded-2xl max-w-full" />
                    ) : (
                      <p className="text-base leading-relaxed">{m.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="glass border-t border-glass-stroke p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPromptSheet(true)}
                  className="p-4 rounded-2xl glass neon-border-pink"
                >
                  <Camera className="w-6 h-6 text-neon-pink" />
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Напиши что угодно..."
                  className="flex-1 bg-transparent outline-none text-base"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-4 bg-neon-pink rounded-2xl neon-pulse"
                >
                  <Send className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Generation Bottom Sheet */}
      <AnimatePresence>
        {showPromptSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setShowPromptSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 glass rounded-t-3xl p-6 z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              <h3 className="text-2xl font-medium mb-6">Создать изображение</h3>
              <input
                placeholder="Опиши фантазию..."
                className="w-full glass rounded-2xl px-5 py-4 outline-none neon-border-pink focus:ring-4 ring-neon-pink/30"
              />
              <div className="flex flex-wrap gap-3 my-6">
                {["Ню", "В белье", "Романтика", "Фантазия"].map(tag => (
                  <span key={tag} className="px-4 py-2 glass rounded-full text-sm">{tag}</span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-6 bg-gradient-to-r from-neon-pink via-glow-purple to-neon-cyan rounded-3xl text-xl font-medium neon-pulse liquid"
              >
                Создать • 12 кредитов
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
