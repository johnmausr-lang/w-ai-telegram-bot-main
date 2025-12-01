"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera, Mic, ChevronLeft } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");

  const [personality, setPersonality] = useState] = useState({
    gender: null,           // "Женщина" | "Мужчина"
    orientation: null,      // "натурал" | "би" | "лесби"/"гей"
    style: "нежная",        // нежная | дерзкая | покорная | доминантная
    intensity: 70,
    nsfw: true,
    testDone: false,
  });

  const [messages, setMessages] = useState([]); // [{role: "user"|"assistant", content: string}]
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // Автопрокрутка
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
    const voice = personality.gender === "Мужчина" ? "echo" : personality.nsfw ? "shimmer" : "nova";
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    } catch (e) {}
  }, [personality]);

  // 100% РАБОЧИЙ СТРИМИНГ БЕЗ ОШИБКИ [DONE]
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
        body: JSON.stringify({
          message: userMsg,
          personality,
          history: messages,
        }),
      });

      if (!res.ok) throw new Error("Network error");

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

      // Озвучка
      const reply = messages[messages.length - 1]?.content || "";
      if (reply) speak(reply);

    } catch (err) {
      setMessages(prev => {
        const arr = [...prev];
        arr[arr.length - 1].content = "Ой, я потерялась… попробуй ещё раз";
        return arr;
      });
    } finally {
      setLoading(false);
    }
  };

  // Управление чатом
  const undoLastMessage = () => setMessages(prev => prev.length >= 2 ? prev.slice(0, -2) : prev);
  const resetChat = () => {
    setMessages([]);
    setStep("welcome");
  };
    return (
    <div className="min-h-screen flex flex-col overflow-hidden neon-bg">
      <audio ref={audioRef} />

      <AnimatePresence mode="wait">
        {/* === WELCOME === */}
        {step === "welcome" && (
          <motion.div key="welcome" className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-8">
            <motion.h1
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
            >
              Твой AI
            </motion.h1>
            <p className="text-2xl opacity-90">18+ цифровой спутник</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setStep("gender")}
              className="px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold pulse-glow"
            >
              Начать
            </motion.button>
          </motion.div>
        )}

        {/* === GENDER === */}
        {step === "gender" && (
          <motion.div key="gender" className="flex-1 flex flex-col items-center justify-center gap-10 px-6">
            <h2 className="text-4xl md:text-5xl font-bold">Кто будет твоим AI?</h2>
            <div className="flex gap-6">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, gender: "Женщина"})); setStep("orientation"); }} className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-2xl">
                Девушка
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, gender: "Мужчина"})); setStep("orientation"); }} className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-2xl">
                Парень
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* === ORIENTATION === */}
        {step === "orientation" && (
          <motion.div key="orient" className="flex-1 flex flex-col items-center justify-center gap-10 px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center">Ориентация</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: "натурал"})); setStep("style"); }} className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-xl">Натурал</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: "би"})); setStep("style"); }} className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-xl">Би</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: p.gender === "Мужчина" ? "гей" : "лесби"})); setStep("style"); }} className="px-8 py-4 rounded-full bg-gradient-to-r from-red-500 to-purple-500 text-xl">
                {personality.gender === "Мужчина" ? "Гей" : "Лесби"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* === STYLE === */}
        {step === "style" && (
          <motion.div key="style" className="flex-1 flex flex-col items-center justify-center gap-10 px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center">Стиль общения</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {["нежная", "дерзкая", "покорная", "доминантная"].map(s => (
                <motion.button key={s} whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, style: s})); setStep("chat"); }} className="px-6 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xl capitalize">
                  {s === "нежная" ? "Нежная" : s === "дерзкая" ? "Дерзкая" : s === "покорная" ? "Покорная" : "Доминантная"}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* === CHAT === */}
        {step === "chat" && (
          <motion.div key="chat" className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] px-5 py-3 rounded-3xl text-lg md:text-xl ${
                    m.role === "user" ? "ml-auto bg-gradient-to-l from-purple-600 to-pink-600" : "mr-auto bg-gradient-to-r from-pink-600 to-purple-600"
                  }`}
                >
                  {m.content || (m.role === "assistant" && "...")}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Нижняя панель */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
              <div className="flex gap-3 items-center mb-3">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши..."
                  rows={1}
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur border border-white/20 focus:border-pink-500 outline-none resize-none text-lg"
                />
                <button onClick={() => setInput(personality.nsfw ? "хочу тебя..." : "привет")} className="p-4 rounded-full bg-pink-600">
                  <Heart className="w-7 h-7" />
                </button>
                <button onClick={sendMessage} disabled={loading} className="p-4 rounded-full bg-purple-600 disabled:opacity-50">
                  <MessageCircle className="w-7 h-7" />
                </button>
                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-4 rounded-full bg-red-600">
                  <Camera className="w-7 h-7" />
                </button>
              </div>

              <div className="flex justify-center gap-6 text-sm">
                <button onClick={undoLastMessage} className="flex items-center gap-2 px-5 py-2 bg-red-600/80 rounded-full hover:bg-red-500 transition">
                  <ChevronLeft className="w-5 h-5" /> Назад
                </button>
                <button onClick={resetChat} className="px-6 py-2 bg-purple-600/80 rounded-full hover:bg-purple-500 transition">
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
