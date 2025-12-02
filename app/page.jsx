"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Camera, ChevronLeft, RotateCcw, MessageSquare } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [userGender, setUserGender] = useState(null); // кто ТЫ
  const [aiGender, setAiGender] = useState(null);     // кто твой AI
  const [orientation, setOrientation] = useState(null); // вычисляется автоматически
  const [style, setStyle] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [history, setHistory] = useState([]); // память диалогов

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // === Генерация фото ===
  const generatePhoto = async () => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);
    setMessages(prev => [...prev, { role: "assistant", content: "Генерирую фото... (15–25 сек)" }]);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });
      const { imageUrl } = await res.json();

      setMessages(prev => prev
        .filter(m => m.content !== "Генерирую фото... (15–25 сек)")
        .concat({ role: "assistant", content: imageUrl, type: "image" })
      );
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Ошибка генерации" }]);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // === Кнопки управления ===
  const goBack = () => {
    if (step === "ai-gender") setStep("user-gender");
    if (step === "style") setStep("ai-gender");
    if (step === "chat") setStep("style");
  };

  const resetChat = () => {
    setMessages([]);
    setStep("welcome");
    setUserGender(null);
    setAiGender(null);
    setStyle(null);
  };

  const startNewDialog = () => {
    if (messages.length > 0) {
      setHistory(prev => [...prev, { title: messages[0]?.content?.slice(0, 30) || "Новый диалог", messages }]);
    }
    setMessages([]);
  };

  // === Вычисляем ориентацию ===
  useEffect(() => {
    if (userGender && aiGender) {
      if (userGender === aiGender) {
        setOrientation(userGender === "Мужчина" ? "гей" : "лесби");
      } else {
        setOrientation("натурал");
      }
    }
  }, [userGender, aiGender]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-950 via-pink-900 to-black text-white">
      {/* === ВЕРХНЯЯ ПАНЕЛЬ — Назад + Новый диалог === */}
      {step !== "welcome" && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-lg border-b border-white/10 p-4 flex justify-between items-center">
          <button onClick={goBack} className="flex items-center gap-2 text-sm px-4 py-2 bg-red-600/70 rounded-full">
            <ChevronLeft className="w-5 h-5" /> Назад
          </button>
          <button onClick={startNewDialog} className="flex items-center gap-2 text-sm px-4 py-2 bg-purple-600/70 rounded-full">
            <MessageSquare className="w-5 h-5" /> Новый диалог
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* WELCOME */}
        {step === "welcome" && (
          <motion.div key="welcome" className="flex-1 flex flex-col items-center justify-center px-6 gap-10 text-center pt-20">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
              Твой AI 18+
            </h1>
            <button onClick={() => setStep("user-gender")} className="px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold">
              Начать
            </button>
          </motion.div>
        )}

        {/* Кто ТЫ? */}
        {step === "user-gender" && (
          <motion.div key="user" className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-5xl font-bold text-center">Кто ты?</h2>
            <div className="flex gap-8">
              <button onClick={() => { setUserGender("Девушка"); setStep("ai-gender"); }}
                className="px-12 py-8 rounded-full bg-pink-600 text-3xl font-bold">Девушка</button>
              <button onClick={() => { setUserGender("Мужчина"); setStep("ai-gender"); }}
                className="px-12 py-8 rounded-full bg-blue-600 text-3xl font-bold">Парень</button>
            </div>
          </motion.div>
        )}

        {/* Кто будет твой AI? */}
        {step === "ai-gender" && (
          <motion.div key="ai" className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-5xl font-bold text-center">Кто будет твоим AI?</h2>
            <div className="flex gap-8">
              <button onClick={() => { setAiGender("Девушка"); setStep("style"); }}
                className="px-12 py-8 rounded-full bg-pink-600 text-3xl font-bold">Девушка</button>
              <button onClick={() => { setAiGender("Мужчина"); setStep("style"); }}
                className="px-12 py-8 rounded-full bg-blue-600 text-3xl font-bold">Парень</button>
            </div>
          </motion.div>
        )}

        {/* Стиль */}
        {step === "style" && (
          <motion.div key="style" className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-5xl font-bold text-center">Стиль общения</h2>
            <div className="grid grid-cols-2 gap-6">
              {["нежная", "дерзкая", "покорная", "доминантная"].map(s => (
                <button key={s} onClick={() => { setStyle(s); setStep("chat"); }}
                  className="px-10 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold capitalize">
                  {s === "нежная" ? "Нежная" : s === "дерзкая" ? "Дерзкая" : s === "покорная" ? "Покорная" : "Доминантная"}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ЧАТ */}
        {step === "chat" && (
          <div className="flex flex-col h-screen pt-20">
            <div className="flex-1 overflow-y-auto px-4 space-y-5 pb-36">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-3xl px-5 py-3 ${m.role === "user" ? "bg-purple-700" : "bg-pink-700"}`}>
                    {m.type === "image" ? (
                      <img 
                        src={m.content} 
                        alt="18+" 
                        className="rounded-2xl w-full max-w-sm mx-auto cursor-pointer border-4 border-purple-500/60 shadow-2xl"
                        onClick={() => window.open(m.content, "_blank")}
                      />
                    ) : (
                      <p className="text-lg">{m.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Нижняя панель */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4">
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), generatePhoto())}
                  placeholder="Напиши или нажми камеру..."
                  rows={1}
                  className="flex-1 bg-white/10 rounded-2xl px-5 py-3.5 text-base outline-none resize-none max-h-32"
                />
                <button onClick={() => setInput("сделай фото")} className="p-4 bg-pink-600 rounded-full">
                  <Heart className="w-6 h-6" />
                </button>
                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-4 bg-red-600 rounded-full relative">
                  <Camera className="w-6 h-6" />
                  {generatingPhoto && <div className="absolute inset-0 border-4 border-t-transparent border-white rounded-full animate-spin"></div>}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
