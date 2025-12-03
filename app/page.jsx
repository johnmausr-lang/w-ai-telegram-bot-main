// app/page.jsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Camera, ChevronLeft, Sparkles } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: null,
    orientation: null,
    style: null,
    nsfw: true,
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // === TTS ===
  const speak = useCallback(async (text) => {
    if (!text?.trim()) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {}
  }, []);

  // === Отправка сообщения ===
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setLoading(true);

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, personality, history: messages }),
      });

      if (!res.ok) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let line of lines) {
          line = line.trim();
          if (!line || line === "data: [DONE]") continue;
          if (!line.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(line.slice(6));
            const delta = data.choices?.[0]?.delta?.content || "";
            if (delta) {
              setMessages(prev => {
                const arr = [...prev];
                arr[arr.length - 1].content += delta;
                return arr;
              });
            }
          } catch (e) {}
        }
      }

      const finalReply = messages[messages.length - 1]?.content || "";
      if (finalReply) speak(finalReply);

    } catch (err) {
      setMessages(prev => {
        const arr = [...prev];
        arr[arr.length - 1].content = "Ой, что-то пошло не так… попробуй ещё раз";
        return arr;
      });
    } finally {
      setLoading(false);
    }
  };

  // === Генерация фото ===
  const generatePhoto = async () => {
    if (generatingPhoto || !input.trim()) return;
    setGeneratingPhoto(true);

    setMessages(prev => [...prev, { role: "assistant", content: "Генерирую горячее фото... (15–25 сек)" }]);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      const { imageUrl } = await res.json();

      setMessages(prev => prev
        .filter(m => m.content !== "Генерирую горячее фото... (15–25 сек)")
        .concat({ role: "assistant", content: imageUrl, type: "image" })
      );
    } catch (e) {
      setMessages(prev => prev
        .filter(m => m.content !== "Генерирую горячее фото... (15–25 сек)")
        .concat({ role: "assistant", content: "Не получилось… попробуй другой запрос" })
      );
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // === Управление чатом ===
  const undoLastMessage = () => {
    setMessages(prev => prev.slice(0, -2));
  };

  const resetChat = () => {
    setMessages([]);
    setStep("welcome");
  };

  return (
    <div className="min-h-screen w-screen neon-bg flex items-center justify-center">
      <audio ref={audioRef} />

      <AnimatePresence mode="wait">
        {/* === WELCOME === */}
        {step === "welcome" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center flex flex-col items-center justify-center gap-12 px-6"
          >
            <div className="relative">
              <Sparkles className="w-24 h-24 text-pink-500 absolute -top-12 -left-12 animate-pulse" />
              <h1 className="text-6xl sm:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Neon Glow AI
              </h1>
              <p className="text-xl mt-4 text-purple-300">Твой 18+ цифровой спутник</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setStep("gender")}
              className="px-12 py-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-3xl font-bold pulse-glow"
            >
              Начать
            </motion.button>
          </motion.div>
        )}

        {/* === GENDER === */}
        {step === "gender" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-4xl sm:text-5xl font-bold">Кто тебя заводит?</h2>
            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
              {["Девушка", "Парень"].map(g => (
                <motion.button key={g} whileHover={{ scale: 1.1 }}
                  onClick={() => { setPersonality(p => ({...p, gender: g})); setStep("orientation"); }}
                  className="px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold">
                  {g}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* === ORIENTATION === */}
        {step === "orientation" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-4xl sm:text-5xl font-bold">Ориентация</h2>
            <div className="grid grid-cols-1 gap-6 w-full max-w-lg">
              {["натурал", "би", "гей/лесби"].map(o => (
                <motion.button key={o} whileHover={{ scale: 1.1 }}
                  onClick={() => { setPersonality(p => ({...p, orientation: o})); setStep("style"); }}
                  className="px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold capitalize">
                  {o}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* === STYLE === */}
        {step === "style" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-center">Стиль общения</h2>
            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
              {["нежная", "дерзкая", "покорная", "доминантная"].map(s => (
                <motion.button key={s} whileHover={{ scale: 1.1 }}
                  onClick={() => { setPersonality(p => ({...p, style: s})); setStep("chat"); }}
                  className="px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold capitalize">
                  {s === "нежная" ? "Нежная" : s === "дерзкая" ? "Дерзкая" : s === "покорная" ? "Покорная" : "Доминантная"}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* === ЧАТ === */}
        {step === "chat" && (
          <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-5">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-3xl px-5 py-3 shadow-2xl text-white ${
                    m.role === "user" 
                      ? "bg-gradient-to-l from-purple-700 to-pink-700" 
                      : "bg-gradient-to-r from-pink-700 to-purple-700"
                  }`}>
                    {m.type === "image" ? (
                      <img 
                        src={m.content} 
                        alt="18+" 
                        className="rounded-2xl w-full max-w-xs sm:max-w-sm mx-auto border-4 border-purple-500/60 shadow-2xl"
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

            {/* Нижняя панель */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10">
              <div className="p-4 flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши или нажми камеру..."
                  rows={1}
                  className="flex-1 bg-white/10 rounded-2xl px-5 py-3.5 text-base outline-none resize-none max-h-32 placeholder-white/50 scrollbar-hide"
                />
                <button onClick={() => setInput(prev => prev + " ❤️")} className="p-3.5 bg-pink-600 rounded-full shadow-lg">
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

              <div className="flex justify-center gap-6 pb-4">
                <button onClick={undoLastMessage} className="flex items-center gap-2 px-5 py-2 bg-red-600/80 rounded-full text-sm">
                  <ChevronLeft className="w-5 h-5" /> Назад
                </button>
                <button onClick={resetChat} className="px-6 py-2 bg-purple-600/80 rounded-full text-sm">
                  Новая беседа
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
