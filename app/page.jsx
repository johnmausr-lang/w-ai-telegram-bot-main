"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera, Mic } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: null,
    orientation: null,
    mode: null,
    style: "нежная",  // Добавляем стиль: нежная, дерзкая, покорная, доминантная
    intensity: 50,
    testAnswers: {},
    testDone: false,
    nsfw: false,
  });
  const [messages, setMessages] = useState([]); // Теперь array of { role: 'user'/'assistant', content: string }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null); // Для автопрокрутки

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Голосовой ответ (TTS) с использованием локального API
  const speak = useCallback(async (text) => {
    if (!text) return;
    const voice = personality.gender === "Мужчина" ? "echo" : personality.nsfw ? "shimmer" : "nova";
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.error("TTS failed:", e);
    }
  }, [personality.gender, personality.nsfw]);

  // Убрали handleSecretCommand полностью — больше нет секретных слов

  // Функция отправки сообщения с стримингом
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]); // Добавляем плейсхолдер для стриминга
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, personality, history: messages }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.choices) {
              const delta = data.choices[0]?.delta?.content || "";
              reply += delta;
              setMessages((prev) => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = reply;
                return newMsgs;
              });
            }
          }
        }
      }

      speak(reply);
    } catch (e) {
      console.error("Send error:", e);
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = "Ой, что-то пошло не так... ❤️";
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };

  // Функции назад и новая беседа
  const undoLastMessage = () => {
    if (messages.length < 2) return;
    setMessages(messages.slice(0, -2)); // Убираем сообщение пользователя и ответ
  };

  const resetChat = () => {
    setMessages([]);
    setStep("welcome");
  };

  // Функция генерации фото (оставляем как есть, но с заглушкой)
  const generatePhoto = async () => {
    setGeneratingPhoto(true);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "обнажённая в эротической позе, неон" }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.imageUrl || "Фото готово!" }]);
    } catch (e) {
      console.error("Photo error:", e);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // UI для выбора стиля (добавляем в welcome step или тест)
  // Предполагаем, что в твоём UI есть выбор стиля — добавь кнопки для "нежная", "дерзкая", "покорная", "доминантная"
  // Например, в тест или в настройках:
  // <button onClick={() => setPersonality({...personality, style: "нежная"})}>Нежная</button>

  // Остальной код UI (адаптирован с удалением секретных слов)
  return (
    <div className="min-h-screen flex flex-col overflow-hidden neon-bg relative">
      <audio ref={audioRef} />
      <AnimatePresence>
        {step === "welcome" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 text-center px-5">
            <motion.h1 animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5x l md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 pulse-glow">
              Твой AI Спутник
            </motion.h1>
            <p className="text-xl md:text-2xl mt-5">18+ цифровой компаньон</p>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep("gender")} className="mt-10 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xl font-bold pulse-glow spotlight-hover">
              Начать
            </motion.button>
          </motion.div>
        )}

        {step === "gender" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 text-center px-5">
            <h2 className="text-4xl md:text-5xl font-bold mb-10">Выбери пол AI</h2>
            <div className="flex gap-5">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, gender: "Женщина"}); setStep("orientation"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-xl pulse-glow">
                Женщина
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, gender: "Мужчина"}); setStep("orientation"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xl pulse-glow">
                Мужчина
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "orientation" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 text-center px-5">
            <h2 className="text-4xl md:text-5xl font-bold mb-10">Выбери ориентацию AI</h2>
            <div className="flex gap-5">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, orientation: "натурал"}); setStep("style"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-xl pulse-glow">
                Натурал
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, orientation: "би"}); setStep("style"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xl pulse-glow">
                Би
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, orientation: personality.gender === "Мужчина" ? "гей" : "лесби"}); setStep("style"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-purple-500 text-xl pulse-glow">
                {personality.gender === "Мужчина" ? "Гей" : "Лесби"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "style" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 text-center px-5">
            <h2 className="text-4xl md:text-5xl font-bold mb-10">Выбери стиль общения</h2>
            <div className="flex flex-wrap gap-5">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, style: "нежная"}); setStep("mode"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-xl pulse-glow">
                Нежная
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, style: "дерзкая"}); setStep("mode"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-purple-500 text-xl pulse-glow">
                Дерзкая
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, style: "покорная"}); setStep("mode"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xl pulse-glow">
                Покорная
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, style: "доминантная"}); setStep("mode"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xl pulse-glow">
                Доминантная
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "mode" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 text-center px-5">
            <h2 className="text-4xl md:text-5xl font-bold mb-10">Выбери режим</h2>
            <div className="flex gap-5">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, mode: "flirt"}); setStep("intensity"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-xl pulse-glow">
                Флирт
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, mode: "friend"}); setStep("intensity"); }} className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xl pulse-glow">
                Друг
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "intensity" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 text-center px-5">
            <h2 className="text-4xl md:text-5xl font-bold mb-10">Уровень интенсивности</h2>
            <input type="range" min="0" max="100" value={personality.intensity} onChange={(e) => setPersonality({...personality, intensity: e.target.value})} className="w-64 slider" />
            <p className="mt-5 text-xl">{personality.intensity}%</p>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep("test")} className="mt-10 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xl font-bold pulse-glow">
              Далее
            </motion.button>
          </motion.div>
        )}

        {step === "test" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 text-center px-5">
            <h2 className="text-4xl md:text-5xl font-bold mb-10">Тест на совместимость</h2>
            {/* Тест вопросы — оставляем как есть, но после теста setStep("chat") */}
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality({...personality, testDone: true}); setStep("chat"); }} className="mt-10 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xl font-bold pulse-glow">
              Закончить тест
            </motion.button>
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-3xl px-5 py-3 max-w-md text-base md:text-xl ${msg.role === "user" ? "ml-auto bg-purple-600/80" : "mr-auto bg-pink-600/80 ai-text"}`}>
                  {msg.content}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex gap-3 items-center">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="Напиши..." className="flex-1 px-5 py-3 rounded-full bg-white/10 backdrop-blur border border-white/20 focus:border-pink-400 outline-none text-base md:text-xl transition-all" />
                <button onClick={() => setInput(personality.nsfw ? "хочу тебя" : "привет")} className="p-3 rounded-full bg-pink-500 pulse-glow">
                  <Heart className="w-6 h-6" />
                </button>
                <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-3 rounded-full bg-purple-500 disabled:opacity-30 pulse-glow">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-3 rounded-full bg-red-600 disabled:opacity-30 pulse-glow">
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              <div className="flex gap-3 p-4 bg-gradient-to-t from-black/80">
                <button onClick={undoLastMessage} className="px-5 py-2 bg-red-600/80 rounded-xl hover:bg-red-500 transition">
                  ← Назад
                </button>
                <button onClick={resetChat} className="px-5 py-2 bg-purple-600/80 rounded-xl hover:bg-purple-500 transition">
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
