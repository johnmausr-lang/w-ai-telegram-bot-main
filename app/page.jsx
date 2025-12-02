"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Heart, MessageCircle, Camera, ChevronLeft, Menu, X, Trash2, Download, Sparkles, Zap } from "lucide-react";

const MAX_CHATS = 10;

export default function NeonGlowAI() {
  const [step, setStep] = useState("whoAreYou");
  const [userGender, setUserGender] = useState(null); // "Парень" | "Девушка"
  const [partnerGender, setPartnerGender] = useState(null);
  const [style, setStyle] = useState(null);
  const [nsfwLevel, setNsfwLevel] = useState(70); // 0–100

  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]); // [{ id, title, messages, personality, createdAt }]
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [fullImageGen, setFullImageGen] = useState(null); // { prompt }

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // Haptic Feedback
  const haptic = (type = "light") => {
    if (navigator.vibrate) {
      const patterns = { light: [30], medium: [60], heavy: [100, 50, 100] };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  };

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("neonChats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) {
        const last = parsed[0];
        setCurrentChatId(last.id);
        setMessages(last.messages);
        setUserGender(last.personality.userGender);
        setPartnerGender(last.personality.partnerGender);
        setStyle(last.personality.style);
        setNsfwLevel(last.personality.nsfwLevel || 70);
        setStep("chat");
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("neonChats", JSON.stringify(chats.slice(0, MAX_CHATS)));
    }
  }, [chats]);

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    const id = Date.now().toString();
    const newChat = {
      id,
      title: `${partnerGender} • ${style}`,
      messages: [],
      personality: { userGender, partnerGender, style, nsfwLevel },
      createdAt: new Date().toISOString(),
    };
    setChats(prev => [newChat, ...prev].slice(0, MAX_CHATS));
    setCurrentChatId(id);
    setMessages([]);
    setStep("chat");
    setShowMenu(false);
    haptic("medium");
  };

  const selectChat = (chat) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages);
    setUserGender(chat.personality.userGender);
    setPartnerGender(chat.personality.partnerGender);
    setStyle(chat.personality.style);
    setNsfwLevel(chat.personality.nsfwLevel || 70);
    setStep("chat");
    setShowMenu(false);
    haptic();
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
      setStep("whoAreYou");
    }
    haptic("heavy");
  };

  // === Чат + генерация ===
  const sendMessage = async () => { /* тот же код, что был — не меняем */ }
  const generatePhoto = async () => { /* тот же код */ }

  const currentPersonality = { userGender, partnerGender, style, nsfwLevel: nsfwLevel / 100 };

  return (
    <LayoutGroup>
      <div className="relative min-h-screen w-screen overflow-hidden bg-deep-onyx neon-bg particles-bg">
        <audio ref={audioRef} className="hidden" />

        {/* Боковое меню */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 w-80 glass-panel z-50 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-2xl font-bold">История</h2>
                <button onClick={() => setShowMenu(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chats.map(chat => (
                  <motion.div
                    key={chat.id}
                    layoutId={`chat-${chat.id}`}
                    onClick={() => selectChat(chat)}
                    className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{chat.title}</p>
                      <p className="text-sm text-secondary-text">
                        {new Date(chat.createdAt).toLocaleDateString("ru")}
                      </p>
                    </div>
                    <button onClick={(e) => deleteChat(chat.id, e)} className="text-error-red">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-white/10">
                <button onClick={() => { setStep("whoAreYou"); setShowMenu(false); }} className="w-full py-3 bg-accent-gradient-1 rounded-2xl">
                  Новый спутник
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Онбординг */}
        <AnimatePresence mode="wait">
          {step === "whoAreYou" && (
            <motion.div key="whoAreYou" className="flex flex-col items-center justify-center h-screen px-6">
              <motion.h1 className="text-5xl font-bold mb-12 breathing-glow">Кто ты?</motion.h1>
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {["Девушка", "Парень"].map(g => (
                  <motion.button
                    layoutId={`gender-${g}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setUserGender(g); setStep("whoPartner"); haptic(); }}
                    className="py-16 bg-glass-dark rounded-3xl text-3xl font-bold neon-border"
                  >
                    {g}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "whoPartner" && (
            <motion.div key="whoPartner" className="flex flex-col items-center justify-center h-screen px-6">
              <motion.h1 className="text-5xl font-bold mb-12 breathing-glow">Кто твой спутник?</motion.h1>
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {["Девушка", "Парень"].map(g => (
                  <motion.button
                    layoutId={`partner-${g}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setPartnerGender(g); setStep("style"); haptic(); }}
                    className="py-16 bg-glass-dark rounded-3xl text-3xl font-bold neon-border"
                  >
                    {g}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "style" && (
            <motion.div key="style" className="flex flex-col items-center justify-center h-screen px-6">
              <motion.h1 className="text-5xl font-bold mb-12 breathing-glow">Стиль общения</motion.h1>
              <div className="space-y-6 w-full max-w-md">
                {["нежная", "дерзкая", "покорная", "доминантная"].map(s => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setStyle(s); startNewChat(); }}
                    className="w-full py-6 bg-glass-dark rounded-3xl text-2xl font-medium neon-border"
                  >
                    {s === "нежная" ? "Нежная" : s === "дерзкая" ? "Дерзкая" : s === "покорная" ? "Покорная" : "Доминантная"}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Чат */}
          {step === "chat" && !fullImageGen && (
            <div className="flex flex-col h-screen">
              {/* Шапка */}
              <motion.div className="fixed top-0 left-0 right-0 glass-panel z-40 p-4 flex items-center justify-between">
                <button onClick={() => setShowMenu(true)}><Menu className="w-7 h-7" /></button>
                <div className="text-center">
                  <p className="font-bold text-lg">{partnerGender} • {style}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Zap className="w-4 h-4 text-toxic-mint" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={nsfwLevel}
                      onChange={(e) => setNsfwLevel(+e.target.value)}
                      className="w-32 accent-toxic-mint"
                    />
                    <span className="text-xs">{nsfwLevel}%</span>
                  </div>
                </div>
                <button onClick={() => setShowGallery(true)}><Camera className="w-7 h-7" /></button>
              </motion.div>

              <div className="flex-1 overflow-y-auto pt-24 pb-40 px-4 space-y-5">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    layoutId={`msg-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-3xl px-5 py-3 glass-panel ${m.role === "user" ? "bg-accent-gradient-1/30" : "bg-accent-gradient-2/30"} neon-border`}>
                      {m.type === "image" ? (
                        <motion.img
                          layoutId={`img-${m.content}`}
                          src={m.content}
                          onClick={() => setFullImageGen({ imageUrl: m.content })}
                          className="rounded-2xl max-w-full cursor-pointer breathing-glow"
                        />
                      ) : (
                        <p className="text-lg leading-relaxed ai-text">{m.content || "..."}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Нижняя панель */}
              <motion.div className="fixed bottom-6 left-4 right-4 glass-panel rounded-3xl p-4">
                <div className="flex items-end gap-3">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Напиши что угодно..."
                    rows={1}
                    className="flex-1 bg-transparent outline-none resize-none max-h-32 placeholder-secondary-text"
                  />
                  {input.toLowerCase().includes("фото") || input.toLowerCase().includes("сделай") ? (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={generatePhoto}
                      className="p-4 bg-accent-gradient-1 rounded-full pulse-glow"
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.button>
                  ) : null}
                  <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage} className="p-4 bg-accent-gradient-2 rounded-full">
                    <MessageCircle className="w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Полноэкранная генерация */}
          {fullImageGen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
            >
              {generatingPhoto ? (
                <div className="relative">
                  <div className="w-64 h-64 bg-gradient-to-br from-neon-crimson to-emerald-glow rounded-full blur-3xl animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-8 border-t-transparent border-toxic-mint rounded-full animate-spin" />
                  </div>
                </div>
              ) : (
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={fullImageGen.imageUrl}
                  className="max-w-full max-h-full rounded-3xl shadow-2xl"
                />
              )}
              <div className="fixed bottom-8 left-8 right-8 flex gap-4">
                <button className="flex-1 py-4 bg-accent-gradient-1 rounded-2xl">Сохранить</button>
                <button className="flex-1 py-4 bg-accent-gradient-2 rounded-2xl">Вариации</button>
                <button onClick={() => setFullImageGen(null)} className="p-4 bg-white/10 rounded-2xl"><X className="w-8 h-8" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
