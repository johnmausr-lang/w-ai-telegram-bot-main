"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera, ChevronLeft } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");

  const [personality, setPersonality] = useState({
    gender: null,           // "Женщина" | "Мужчина"
    orientation: null,      // "натурал" | "би" | "лесби"/"гей"
    style: "нежная",
    intensity: 80,
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

  // СТРИМИНГ ЧАТА (без ошибок)
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

  // ГЕНЕРАЦИЯ ГОЛЫХ ФОТО (парни и девушки!)
  const generatePhoto = async () => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);

    setMessages(prev => [...prev, { role: "assistant", content: "Генерирую горячее фото... (15–20 сек)" }]);

    try {
      let prompt = input.trim();

      // Автоматически добавляем нужный пол
      if (personality.gender === "Мужчина") {
        prompt = prompt ? `${prompt}, naked handsome man, muscular, erect penis visible, detailed anatomy, 8k` :
          "handsome naked man with hard cock, full frontal nudity, detailed muscles, 8k, ultra realistic";
      } else {
        prompt = prompt ? `${prompt}, beautiful naked woman, spreading legs, detailed pussy, wet, aroused, 8k` :
          "gorgeous naked girl spreading legs, showing pussy and anus, ultra detailed, 8k, wet skin";
      }

      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== "Генерирую горячее фото... (15–20 сек)");
        if (data.imageUrl) {
          filtered.push({ role: "assistant", content: data.imageUrl, type: "image" });
        } else {
          filtered.push({ role: "assistant", content: "Не смогла сгенерировать фото... попробуй ещё раз" });
        }
        return filtered;
      });

    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Ошибка генерации фото..." }]);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  const undoLastMessage = () => setMessages(prev => prev.length >= 2 ? prev.slice(0, -2) : prev);
  const resetChat = () => {
    setMessages([]);
    setStep("welcome");
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden neon-bg">
      <audio ref={audioRef} />

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-8">
            <motion.h1 animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Твой AI
            </motion.h1>
            <p className="text-2xl opacity-90">18+ спутник без цензуры</p>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep("gender")}
              className="px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-3xl font-bold pulse-glow">
              Начать
            </motion.button>
          </motion.div>
        )}

        {step === "gender" && (
          <motion.div key="gender" className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-5xl font-bold">Кто будет твоим AI?</h2>
            <div className="flex gap-8">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, gender: "Женщина"})); setStep("orientation"); }}
                className="px-12 py-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-2xl font-bold">Девушка</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, gender: "Мужчина"})); setStep("orientation"); }}
                className="px-12 py-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-2xl font-bold">Парень</motion.button>
            </div>
          </motion.div>
        )}

        {step === "orientation" && (
          <motion.div key="orient" className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-5xl font-bold text-center">Ориентация</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: "натурал"})); setStep("style"); }}
                className="px-10 py-5 rounded-full bg-pink-500 text-xl font-bold">Натурал</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: "би"})); setStep("style"); }}
                className="px-10 py-5 rounded-full bg-purple-500 text-xl font-bold">Би</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: p.gender === "Мужчина" ? "гей" : "лесби"})); setStep("style"); }}
                className="px-10 py-5 rounded-full bg-red-600 text-xl font-bold">
                {personality.gender === "Мужчина" ? "Гей" : "Лесби"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "style" && (
          <motion.div key="style" className="flex-1 flex flex-col items-center justify-center gap-12 px-6">
            <h2 className="text-5xl font-bold text-center">Стиль общения</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {["нежная", "дерзкая", "покорная", "доминантная"].map(s => (
                <motion.button key={s} whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, style: s})); setStep("chat"); }}
                  className="px-8 py-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xl font-bold capitalize">
                  {s === "нежная" ? "Нежная" : s === "дерзкая" ? "Дерзкая" : s === "покорная" ? "Покорная" : "Доминантная"}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ЧАТ С КРАСИВЫМИ ФОТО */}
        {step === "chat" && (
          <motion.div key="chat" className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] px-5 py-3 rounded-3xl text-lg md:text-xl shadow-2xl ${
                    m.role === "user"
                      ? "ml-auto bg-gradient-to-l from-purple-600 to-pink-600 text-white"
                      : "mr-auto bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                  }`}
                >
                  {m.type === "image" ? (
                    <img
                      src={m.content}
                      alt="Горячее фото"
                      className="rounded-2xl max-w-full h-auto border-4 border-white/20 shadow-xl"
                      onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                    />
                  ) : (
                    m.content || (m.role === "assistant" && "...")
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90">
              <div className="flex gap-3 items-center mb-3">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши или нажми камеру..."
                  rows={1}
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur border border-white/20 focus:border-pink-500 outline-none resize-none text-lg"
                />
                <button onClick={() => setInput("сделай фото")} className="p-4 rounded-full bg-pink-600">
                  <Heart className="w-7 h-7" />
                </button>
                <button onClick={sendMessage} disabled={loading} className="p-4 rounded-full bg-purple-600 disabled:opacity-50">
                  <MessageCircle className="w-7 h-7" />
                </button>
                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-4 rounded-full bg-red-600 relative">
                  <Camera className="w-7 h-7" />
                  {generatingPhoto && <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-white animate-spin"></div>}
                </button>
              </div>

              <div className="flex justify-center gap-6">
                <button onClick={undoLastMessage} className="flex items-center gap-2 px-6 py-2 bg-red-600/80 rounded-full hover:bg-red-500 transition">
                  <ChevronLeft className="w-5 h-5" /> Назад
                </button>
                <button onClick={resetChat} className="px-8 py-2 bg-purple-600/80 rounded-full hover:bg-purple-500 transition">
                  Новая беседа
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
