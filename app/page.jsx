"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Camera, ChevronLeft } from "lucide-react";

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

  // Автопрокрутка с плавной анимацией
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // === TTS (голос) ===
  const speak = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "shimmer" }),
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

  // === Чат со стримингом ===
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

      // Озвучиваем ответ
      const reply = messages[messages.length - 1]?.content || "";
      if (reply) speak(reply);

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
    if (generatingPhoto) return;
    setGeneratingPhoto(true);

    setMessages(prev => [...prev, { role: "assistant", type: "image", content: "" }]);

    try {
      const prompt = messages.slice(-1)[0]?.content || ""; // Последнее сообщение как промпт
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const { imageUrl } = await res.json();
      if (imageUrl) {
        setMessages(prev => {
          const arr = [...prev];
          arr[arr.length - 1].content = imageUrl;
          return arr;
        });
      }
    } catch (e) {}
    setGeneratingPhoto(false);
  };

  const undoLastMessage = () => {
    setMessages(prev => prev.slice(0, -2));
  };

  const resetChat = () => {
    setMessages([]);
    setStep("welcome");
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden neon-bg particles-bg">
      <audio ref={audioRef} className="hidden" />

      <AnimatePresence mode="wait">
        {/* === ЭКРАН ПРИВЕТСТВИЯ === */}
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center h-screen px-6 text-center glass-panel rounded-3xl mx-4"
          >
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold mb-8 breathing-glow"
            >
              Neon Glow AI
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg mb-12 secondary-text"
            >
              Создай своего идеального спутника 18+
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep("gender")}
              className="px-8 py-4 bg-accent-gradient-1 rounded-full text-lg font-semibold pulse-glow neon-border"
            >
              Начать
            </motion.button>
          </motion.div>
        )}

        {/* === ВЫБОР ПОЛА === */}
        {step === "gender" && (
          <motion.div
            key="gender"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 120 }}
            className="flex flex-col items-center justify-center h-screen px-6 glass-panel rounded-3xl mx-4"
          >
            <h2 className="text-3xl font-bold mb-12">Кто твой спутник?</h2>
            <div className="flex flex-col gap-6 w-full max-w-md">
              {["Девушка", "Парень"].map(g => (
                <motion.button
                  key={g}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPersonality(p => ({ ...p, gender: g }));
                    setStep("orientation");
                  }}
                  className="py-5 bg-glass-dark rounded-2xl text-xl font-medium backdrop-blur-md neon-border"
                >
                  {g}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* === ВЫБОР ОРИЕНТАЦИИ === */}
        {step === "orientation" && (
          <motion.div
            key="orientation"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 120 }}
            className="flex flex-col items-center justify-center h-screen px-6 glass-panel rounded-3xl mx-4"
          >
            <h2 className="text-3xl font-bold mb-12">Ориентация?</h2>
            <div className="flex flex-col gap-6 w-full max-w-md">
              {["натурал", "гей/лесби", "би"].map(o => (
                <motion.button
                  key={o}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPersonality(p => ({ ...p, orientation: o }));
                    setStep("style");
                  }}
                  className="py-5 bg-glass-dark rounded-2xl text-xl font-medium backdrop-blur-md neon-border"
                >
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* === ВЫБОР СТИЛЯ === */}
        {step === "style" && (
          <motion.div
            key="style"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 120 }}
            className="flex flex-col items-center justify-center h-screen px-6 glass-panel rounded-3xl mx-4"
          >
            <h2 className="text-3xl font-bold mb-12">Стиль общения?</h2>
            <div className="flex flex-col gap-6 w-full max-w-md">
              {["нежная", "дерзкая", "покорная", "доминантная"].map(s => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPersonality(p => ({ ...p, style: s }));
                    setStep("chat");
                  }}
                  className="py-5 bg-glass-dark rounded-2xl text-xl font-medium backdrop-blur-md neon-border"
                >
                  {s === "нежная" ? "Нежная" : s === "дерзкая" ? "Дерзкая" : s === "покорная" ? "Покорная" : "Доминантная"}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* === ЧАТ === */}
        {step === "chat" && (
          <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-5 particles-bg">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-3xl px-5 py-3 shadow-2xl text-soft-white glass-panel backdrop-blur-md ${
                    m.role === "user" 
                      ? "bg-accent-gradient-1/30 neon-border" 
                      : "bg-accent-gradient-2/30 neon-border"
                  }`}>
                    {m.type === "image" ? (
                      <motion.img 
                        src={m.content} 
                        alt="18+" 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-2xl w-full max-w-xs sm:max-w-sm mx-auto border-4 border-emerald-glow/60 shadow-2xl breathing-glow"
                        loading="lazy"
                      />
                    ) : (
                      <p className="text-base sm:text-lg leading-relaxed ai-text">{m.content || "..."}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Нижняя панель как плавающая док-панель */}
            <div className="fixed bottom-4 left-4 right-4 bg-glass-dark backdrop-blur-xl rounded-3xl shadow-lg border border-white/10">
              <div className="p-4 flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши или нажми камеру..."
                  rows={1}
                  className="flex-1 bg-transparent rounded-2xl px-5 py-3.5 text-base outline-none resize-none max-h-32 placeholder-secondary-text focus:neon-border"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInput("сделай фото")} 
                  className="p-3.5 bg-accent-gradient-1 rounded-full shadow-lg pulse-glow"
                >
                  <Heart className="w-6 h-6" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage} 
                  disabled={loading} 
                  className="p-3.5 bg-accent-gradient-2 rounded-full shadow-lg pulse-glow"
                >
                  <MessageCircle className="w-6 h-6" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generatePhoto} 
                  disabled={generatingPhoto} 
                  className="p-3.5 bg-accent-gradient-1 rounded-full shadow-lg pulse-glow relative"
                >
                  <Camera className="w-6 h-6" />
                  {generatingPhoto && <div className="absolute inset-0 border-4 border-t-transparent border-toxic-mint rounded-full animate-spin"></div>}
                </motion.button>
              </div>

              <div className="flex justify-center gap-6 pb-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={undoLastMessage} 
                  className="flex items-center gap-2 px-5 py-2 bg-accent-gradient-1/50 rounded-full text-sm neon-border"
                >
                  <ChevronLeft className="w-5 h-5" /> Назад
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetChat} 
                  className="px-6 py-2 bg-accent-gradient-2/50 rounded-full text-sm neon-border"
                >
                  Новая беседа
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
