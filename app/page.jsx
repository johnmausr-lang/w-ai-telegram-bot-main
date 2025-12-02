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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // TTS
  const speak = useCallback(async (text) => {
    if (!text) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: personality.nsfw ? "shimmer" : "nova" }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    } catch (e) {}
  }, [personality.nsfw]);

  // Send message
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

      const reply = messages[messages.length - 1]?.content || "";
      if (reply) speak(reply);

    } catch (err) {
      setMessages(prev => {
        const arr = [...prev];
        arr[arr.length - 1].content = "Ой, я запуталась… попробуй ещё раз";
        return arr;
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate photo
  const generatePhoto = async () => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);

    setMessages(prev => [...prev, { role: "assistant", content: "Генерирую горячее фото... (15–25 сек)" }]);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      const { imageUrl } = await res.json();

      setMessages(prev => 
        prev.filter(m => m.content !== "Генерирую горячее фото... (15–25 сек)")
            .concat({ role: "assistant", content: imageUrl, type: "image" })
      );
    } catch (e) {
      setMessages(prev => prev.filter(m => m.content !== "Генерирую горячее фото... (15–25 сек)")
        .concat({ role: "assistant", content: "Не получилось... попробуй ещё раз" })
      );
    } finally {
      setGeneratingPhoto(false);
    }
  };

  const undoLastMessage = () => setMessages(prev => prev.length >= 2 ? prev.slice(0, -2) : prev);
  const resetChat = () => { setMessages([]); setStep("welcome"); };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-950 via-pink-900 to-black text-white overflow-hidden">
      <audio ref={audioRef} />

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" className="flex-1 flex flex-col items-center justify-center px-6 gap-10 text-center">
            <motion.h1
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent"
            >
              Твой AI 18+
            </motion.h1>
            <p className="text-xl sm:text-2xl opacity-90">Без цензуры • Голос • Голые фото</p>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep("gender")}
              className="px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold shadow-2xl">
              Начать
            </motion.button>
          </motion.div>
        )}

        {step === "gender" && (
          <motion.div key="gender" className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-center">Кто будет твоим AI?</h2>
            <div className="flex flex-col sm:flex-row gap-8">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, gender: "Женщина"})); setStep("orientation"); }}
                className="px-12 py-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-2xl font-bold">Девушка</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, gender: "Мужчина"})); setStep("orientation"); }}
                className="px-12 py-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-2xl font-bold">Парень</motion.button>
            </div>
          </motion.div>
        )}

        {step === "orientation" && (
          <motion.div key="orient" className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-center">Ориентация</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: "натурал"})); setStep("style"); }}
                className="px-8 py-5 rounded-full bg-pink-600 text-xl font-bold">Натурал</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: "би"})); setStep("style"); }}
                className="px-8 py-5 rounded-full bg-purple-600 text-xl font-bold">Би</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: p.gender === "Мужчина" ? "гей" : "лесби"})); setStep("style"); }}
                className="px-8 py-5 rounded-full bg-red-600 text-xl font-bold">
                {personality.gender === "Мужчина" ? "Гей" : "Лесби"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "style" && (
          <motion.div key="style" className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-center">Стиль общения</h2>
            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
              {styles.map(s => (
                <motion.button key={s} whileHover={{ scale: 1.1 }}
                  onClick={() => { setPersonality(p => ({...p, style: s})); setStep("chat"); }}
                  className="px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold capitalize">
                  {s === "нежная" ? "Нежная" : s === "дерзкая" ? "Дерзкая" : s === "покорная" ? "Покорная" : "Доминантная"}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div key="chat" className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-3xl px-5 py-3 ${m.role === "user" ? "bg-purple-700" : "bg-pink-700"}`}>
                    {m.type === "image" ? (
                      <img src={m.content} alt="18+" className="rounded-2xl w-full max-w-sm mx-auto cursor-pointer border-4 border-purple-500/60 shadow-2xl" onClick={() => window.open(m.content, "_blank")} />
                    ) : (
                      <p className="text-base md:text-lg leading-relaxed">{m.content || "..."}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4">
              <div className="flex items-center gap-4">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши..."
                  rows={1}
                  className="flex-1 bg-white/10 rounded-full px-6 py-4 text-base outline-none resize-none max-h-32 placeholder-white/50"
                />
                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-4 bg-red-600 rounded-full shadow-lg relative">
                  <Camera className="w-7 h-7" />
                  {generatingPhoto && <div className="absolute inset-0 border-4 border-t-transparent border-white rounded-full animate-spin"></div>}
                </button>
                <button onClick={sendMessage} className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg">
                  <Send className="w-7 h-7" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
