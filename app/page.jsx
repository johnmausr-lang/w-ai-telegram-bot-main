// app/page.jsx — РАБОЧАЯ ВЕРСИЯ ДЛЯ VERCEL (без внешних компонентов)
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Trash2, Camera, Sparkles, Send, Mic, Download, Zap } from "lucide-react";

const MAX_CHATS = 10;

// ========== ВСЁ В ОДНОМ ФАЙЛЕ ==========
export default function App() {
  const [step, setStep] = useState("onboarding");
  const [userGender, setUserGender] = useState("");
  const [partnerGender, setPartnerGender] = useState("");
  const [style, setStyle] = useState("");
  const [nsfwLevel, setNsfwLevel] = useState(70);

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [fullImage, setFullImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef(null);

  // localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sleek_chats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) {
        setCurrentChat(parsed[0]);
        setMessages(parsed[0].messages || []);
        const p = parsed[0].p;
        setUserGender(p.userGender);
        setPartnerGender(p.partnerGender);
        setStyle(p.style);
        setNsfwLevel(p.nsfwLevel || 70);
        setStep("chat");
      }
    }
  }, []);

  useEffect(() => {
    if (chats.length) {
      localStorage.setItem("sleek_chats", JSON.stringify(chats.slice(0, MAX_CHATS)));
    }
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    const id = Date.now().toString();
    const title = `${partnerGender} • ${style}`;
    const newChat = {
      id,
      title,
      messages: [],
      p: { userGender, partnerGender, style, nsfwLevel },
      createdAt: new Date().toISOString(),
    };
    const updated = [newChat, ...chats].slice(0, MAX_CHATS);
    setChats(updated);
    setCurrentChat(newChat);
    setMessages([]);
    setStep("chat");
  };

  const selectChat = (chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages || []);
    const p = chat.p;
    setUserGender(p.userGender);
    setPartnerGender(p.partnerGender);
    setStyle(p.style);
    setNsfwLevel(p.nsfwLevel || 70);
    setStep("chat");
    setShowSidebar(false);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "Ого, как горячо 🔥" }]);
    }, 1000);
  };

  const generateImage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const fakeImg = "https://picsum.photos/800/1200.jpg";
      setMessages(prev => [...prev, { role: "assistant", type: "image", content: fakeImg }]);
      setIsGenerating(false);
    }, 3000);
  };

  // Онбординг
  if (step === "onboarding") {
    return (
      <div className="min-h-screen bg-[#0A0A0E] flex flex-col items-center justify-center px-8">
        <motion.h1 className="text-5xl font-bold mb-20 bg-gradient-to-r from-[#FF47A3] to-[#00CCFF] bg-clip-text text-transparent">
          {userGender ? (partnerGender ? "Стиль общения" : "Кто твой спутник?") : "Кто ты?"}
        </motion.h1>
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          {(!userGender ? ["Девушка", "Парень"] : !partnerGender ? ["Девушка", "Парень"] : ["нежная", "дерзкая", "покорная", "доминантная"]).map((opt) => (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                if (!userGender) setUserGender(opt);
                else if (!partnerGender) setPartnerGender(opt);
                else { setStyle(opt); startNewChat(); }
              }}
              className="py-20 bg-[#1C1C23]/80 backdrop-blur-xl rounded-3xl text-3xl font-medium border border-white/10 hover:border-[#FF47A3] transition-all"
            >
              {opt === "нежная" ? "Нежная" : opt === "дерзкая" ? "Дерзкая" : opt === "покорная" ? "Покорная" : opt === "доминантная" ? "Доминантная" : opt}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0E] relative">
      {/* Дышащий фон */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#FF47A3]/5 via-transparent to-[#00CCFF]/5" />

      {/* Боковое меню */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed inset-y-0 left-0 w-80 bg-[#1C1C23]/90 backdrop-blur-2xl z-50 flex flex-col">
            <div className="p-5 border-b border-white/10 flex justify-between">
              <h2 className="text-xl font-bold">История</h2>
              <button onClick={() => setShowSidebar(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map(c => (
                <div key={c.id} onClick={() => selectChat(c)} className="p-4 border-b border-white/5 hover:bg-white/10 cursor-pointer flex justify-between">
                  <div><p className="font-medium">{c.title}</p></div>
                  <button onClick={(e) => { e.stopPropagation(); setChats(chats.filter(x => x.id !== c.id)); }}><Trash2 className="w-5 h-5 text-red-500" /></button>
                </div>
              ))}
            </div>
            <div className="p-5">
              <button onClick={() => { setStep("onboarding"); setShowSidebar(false); }} className="w-full py-4 bg-gradient-to-r from-[#FF47A3] to-[#CC338F] rounded-2xl font-bold">
                Новый спутник
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Чат */}
      <div className="flex flex-col h-screen">
        {/* Шапка */}
        <div className="fixed top-0 inset-x-0 bg-[#1C1C23]/80 backdrop-blur-2xl z-40 p-5 flex items-center justify-between">
          <button onClick={() => setShowSidebar(true)}><Menu className="w-7 h-7 text-[#FF47A3]" /></button>
          <div className="text-center">
            <p className="font-bold">{partnerGender} • {style}</p>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-5 h-5 text-[#00CCFF]" />
              <input type="range" min="0" max="100" value={nsfwLevel} onChange={e => setNsfwLevel(+e.target.value)} className="w-28 accent-[#FF47A3]" />
              <span className="text-sm">{nsfwLevel}%</span>
            </div>
          </div>
          <button onClick={() => setShowGallery(true)}><Camera className="w-7 h-7 text-[#FF47A3]" /></button>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto pt-28 pb-32 px-6 space-y-6">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-3xl px-5 py-4 ${m.role === "user" ? "bg-gradient-to-r from-[#FF47A3] to-[#CC338F] text-white" : "bg-[#1C1C23]/80 backdrop-blur-xl border border-white/10"}`}>
                {m.type === "image" ? (
                  <img src={m.content} onClick={() => setFullImage(m.content)} className="rounded-2xl max-w-full cursor-pointer" />
                ) : (
                  <p className="text-base leading-relaxed">{m.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода */}
        <div className="fixed bottom-6 left-6 right-6 bg-[#1C1C23]/80 backdrop-blur-2xl rounded-3xl p-5 border border-white/10">
          <div className="flex items-end gap-3">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="Напиши фантазию..." rows={1} className="flex-1 bg-transparent outline-none resize-none max-h-32 placeholder-[#8A8A99]" />
            {input.toLowerCase().includes("фото") && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={generateImage} className="p-4 bg-gradient-to-r from-[#FF47A3] to-[#CC338F] rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </motion.button>
            )}
            <button onClick={sendMessage} className="p-4 bg-[#00CCFF] rounded-2xl">
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Полноэкранное изображение */}
      <AnimatePresence>
        {fullImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setFullImage(null)}>
            {isGenerating ? (
              <div className="w-80 h-80 bg-gradient-to-br from-[#FF47A3] to-[#00CCFF] rounded-full blur-3xl animate-pulse" />
            ) : (
              <img src={fullImage} className="max-w-full max-h-full rounded-3xl" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
