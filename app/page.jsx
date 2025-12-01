"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Camera, ChevronLeft } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({ gender: null, orientation: null, style: null });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setLoading(true);

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    // Здесь твой рабочий код чата (не трогай)
    // ... (оставь свой код /api/chat)
  };

  const generatePhoto = async () => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);

    setMessages(prev => [...prev, { role: "assistant", content: "Генерирую горячее фото... (15-25 сек)" }]);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      const { imageUrl } = await res.json();

      setMessages(prev => prev
        .filter(m => m.content !== "Генерирую горячее фото... (15-25 сек)")
        .concat({ role: "assistant", content: imageUrl, type: "image" })
      );
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Ошибка генерации... попробуй ещё раз" }]);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  const undo = () => setMessages(prev => prev.length >= 2 ? prev.slice(0, -2) : []);
  const reset = () => { setMessages([]); setStep("welcome"); };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-950 via-pink-900 to-black text-white">
      <AnimatePresence mode="wait">
        {step !== "chat" && (
          <motion.div key={step} className="flex-1 flex flex-col items-center justify-center p-8 gap-10">
            {step === "welcome" && (
              <>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-center bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                  Твой AI 18+
                </h1>
                <button onClick={() => setStep("gender")} className="px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold shadow-2xl">
                  Начать
                </button>
              </>
            )}
            {/* Остальные шаги онбординга — оставь свои */}
          </motion.div>
        )}

        {step === "chat" && (
          <div className="flex flex-col h-screen">
            {/* СООБЩЕНИЯ */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-36 space-y-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[88%] rounded-3xl px-5 py-3 shadow-2xl ${
                    m.role === "user" 
                      ? "bg-gradient-to-l from-purple-600 to-pink-600" 
                      : "bg-gradient-to-r from-pink-600 to-purple-600"
                  }`}>
                    {m.type === "image" ? (
                      <img 
                        src={m.content} 
                        alt="18+" 
                        className="rounded-2xl max-w-full h-auto shadow-xl"
                        loading="lazy"
                      />
                    ) : (
                      <p className="text-base sm:text-lg leading-relaxed">{m.content || "..."}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* НИЖНЯЯ ПАНЕЛЬ — ИДЕАЛЬНО НА ТЕЛЕФОНЕ */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10">
              <div className="p-4 flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши или нажми камеру..."
                  rows={1}
                  className="flex-1 bg-white/10 rounded-2xl px-5 py-3.5 text-base outline-none resize-none max-h-32 scrollbar-hide"
                />
                <button onClick={() => setInput("сделай фото")} className="p-3.5 bg-pink-600 rounded-full shadow-lg">
                  <Heart className="w-6 h-6" />
                </button>
                <button onClick={sendMessage} disabled={loading} className="p-3.5 bg-purple-600 rounded-full shadow-lg">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-3.5 bg-red-600 rounded-full shadow-lg relative">
                  <Camera className="w-6 h-6" />
                  {generatingPhoto && <div className="absolute inset-0 border-4 border-t-transparent border-white rounded-full animate-spin"></div>}
                </button>
              </div>
              <div className="flex justify-center gap-5 pb-4">
                <button onClick={undo} className="px-5 py-2 bg-red-600/70 rounded-full text-sm">Назад</button>
                <button onClick={reset} className="px-6 py-2 bg-purple-600/70 rounded-full text-sm">Новая беседа</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
