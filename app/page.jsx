"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Menu, X, Trash2, Camera, Sparkles, Send, ChevronLeft, Zap } from "lucide-react";

const MAX_CHATS = 10;

export default function ChromaticEclipse() {
  const [step, setStep] = useState("whoAreYou");
  const [userGender, setUserGender] = useState(null);
  const [partnerGender, setPartnerGender] = useState(null);
  const [style, setStyle] = useState(null);
  const [nsfwLevel, setNsfwLevel] = useState(70);

  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [fullImageGen, setFullImageGen] = useState(null);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // Haptic
  const haptic = () => navigator.vibrate?.([30]);

  // localStorage
  useEffect(() => {
    const saved = localStorage.getItem("eclipseChats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) {
        const last = parsed[0];
        setCurrentChatId(last.id);
        setMessages(last.messages);
        setUserGender(last.p.userGender);
        setPartnerGender(last.p.partnerGender);
        setStyle(last.p.style);
        setNsfwLevel(last.p.nsfwLevel || 70);
        setStep("chat");
      }
    }
  }, []);

  useEffect(() => {
    if (chats.length) localStorage.setItem("eclipseChats", JSON.stringify(chats.slice(0, MAX_CHATS)));
  }, [chats]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startNewChat = () => {
    const id = Date.now().toString();
    const title = `${partnerGender} • ${style.charAt(0).toUpperCase() + style.slice(1)}`;
    const newChat = { id, title, messages: [], p: { userGender, partnerGender, style, nsfwLevel }, createdAt: new Date().toISOString() };
    setChats(prev => [newChat, ...prev].slice(0, MAX_CHATS));
    setCurrentChatId(id);
    setMessages([]);
    setStep("chat");
    setShowMenu(false);
    haptic();
  };

  const selectChat = (c) => {
    setCurrentChatId(c.id);
    setMessages(c.messages);
    setUserGender(c.p.userGender);
    setPartnerGender(c.p.partnerGender);
    setStyle(c.p.style);
    setNsfwLevel(c.p.nsfwLevel || 70);
    setStep("chat");
    setShowMenu(false);
  };

  const deleteChat = (id, e) => { e.stopPropagation(); setChats(p => p.filter(x => x.id !== id)); haptic(); };

  // === API функции (оставляем как были) ===
  const sendMessage = async () => { /* твой старый код */ };
  const generatePhoto = async () => { /* твой старый код */ };

  return (
    <LayoutGroup>
      <div className="relative min-h-screen w-screen overflow-hidden bg-eclipse-bg">
        <audio ref={audioRef} className="hidden" />

        {/* Боковое меню */}
        <AnimatePresence>
          {showMenu && (
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-80 glass z-50 flex flex-col">
              <div className="p-6 border-b border-glass-stroke flex justify-between items-center">
                <h2 className="text-2xl font-semibold">История</h2>
                <button onClick={() => setShowMenu(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chats.map(c => (
                  <motion.div key={c.id} layoutId={`chat-${c.id}`} onClick={() => selectChat(c)} className="p-5 border-b border-glass-stroke hover:bg-white/5 cursor-pointer flex justify-between">
                    <div><p className="font-medium">{c.title}</p><p className="text-xs text-text-secondary">{new Date(c.createdAt).toLocaleDateString("ru")}</p></div>
                    <button onClick={(e) => deleteChat(c.id, e)} className="text-error"><Trash2 className="w-5 h-5" /></button>
                  </motion.div>
                ))}
              </div>
              <div className="p-5"><button onClick={() => { setStep("whoAreYou"); setShowMenu(false); }} className="w-full py-4 bg-neon-pink rounded-2xl neon-pulse">Новый спутник</button></div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Онбординг */}
          {["whoAreYou", "whoPartner", "style"].includes(step) && (
            <motion.div key={step} className="flex flex-col items-center justify-center h-screen px-8">
              <h1 className="text-5xl font-bold mb-16 neon-pulse">
                {step === "whoAreYou" && "Кто ты?"}
                {step === "whoPartner" && "Кто твой спутник?"}
                {step === "style" && "Стиль общения"}
              </h1>
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {(step === "whoAreYou" || step === "whoPartner" ? ["Девушка", "Парень"] : ["нежная", "дерзкая", "покорная", "доминантная"]).map((item, i) => (
                  <motion.button
                    key={item}
                    layoutId={`${step}-${item}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (step === "whoAreYou") setUserGender(item);
                      if (step === "whoPartner") setPartnerGender(item);
                      if (step === "style") { setStyle(item); startNewChat(); return; }
                      setStep(step === "whoAreYou" ? "whoPartner" : "style");
                      haptic();
                    }}
                    className="py-20 glass rounded-3xl text-3xl font-medium neon-border-pink"
                  >
                    {item === "нежная" ? "Нежная" : item === "дерзкая" ? "Дерзкая" : item === "покорная" ? "Покорная" : item === "доминантная" ? "Доминантная" : item}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Чат */}
          {step === "chat" && !fullImageGen && (
            <div className="flex flex-col h-screen">
              {/* Шапка */}
              <motion.div className="fixed top-0 left-0 right-0 glass z-40 p-4 flex items-center justify-between">
                <button onClick={() => setShowMenu(true)}><Menu className="w-7 h-7 text-neon-pink" /></button>
                <div className="text-center">
                  <p className="font-bold text-lg">{partnerGender} • {style}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Zap className="w-5 h-5 text-neon-cyan" />
                    <input type="range" min="0" max="100" value={nsfwLevel} onChange={e => setNsfwLevel(+e.target.value)} className="w-32 accent-neon-pink" />
                    <span className="text-sm">{nsfwLevel}%</span>
                  </div>
                </div>
                <button onClick={() => setShowGallery(true)}><Camera className="w-7 h-7 text-neon-pink" /></button>
              </motion.div>

              <div className="flex-1 overflow-y-auto pt-28 pb-40 px-6 space-y-6">
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-3xl px-5 py-4 ${m.role === "user" ? "bg-neon-blend text-white" : "glass neon-border-pink"}`}>
                      {m.type === "image" ? (
                        <motion.img src={m.content} onClick={() => setFullImageGen({ imageUrl: m.content })} className="rounded-2xl max-w-full cursor-pointer" />
                      ) : (
                        <p className="text-base leading-relaxed">{m.content || "..."}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Поле ввода */}
              <motion.div className="fixed bottom-6 left-6 right-6 glass rounded-3xl p-5">
                <div className="flex items-end gap-4">
                  <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Напиши фантазию..." rows={1} className="flex-1 bg-transparent outline-none resize-none max-h-32 placeholder-text-secondary" />
                  {input.toLowerCase().includes("фото") && (
                    <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={generatePhoto} className="p-4 bg-neon-pink rounded-2xl neon-pulse">
                      <Sparkles className="w-6 h-6" />
                    </motion.button>
                  )}
                  <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage} className="p-4 bg-neon-cyan rounded-2xl">
                    <Send className="w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Полноэкранный генератор */}
          {fullImageGen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center">
              {generatingPhoto ? (
                <div className="relative">
                  <div className="w-80 h-80 bg-neon-blend rounded-full blur-3xl animate-pulse liquid" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 border-8 border-t-transparent border-neon-pink rounded-full animate-spin" />
                  </div>
                </div>
              ) : (
                <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={fullImageGen.imageUrl} className="max-w-full max-h-full rounded-3xl shadow-2xl" />
              )}
              <div className="fixed bottom-10 left-8 right-8 flex gap-4">
                <button className="flex-1 py-5 bg-neon-pink rounded-3xl neon-pulse">Сохранить</button>
                <button onClick={() => setFullImageGen(null)} className="p-5 bg-white/10 rounded-3xl"><X className="w-8 h-8" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
