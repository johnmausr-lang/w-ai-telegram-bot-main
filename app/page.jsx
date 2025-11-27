// app/page.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera, Mic, MicOff } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: null,
    orientation: null,
    mode: null,
    intensity: 50,
    testAnswers: {},
    testDone: false,
    nsfw: false,
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, generatingPhoto]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Голосовой ответ (TTS)
  const speak = useCallback(async (text) => {
    if (!text) return;
    const voice = personality.gender === "Мужчина"
      ? "echo"
      : personality.nsfw ? "shimmer" : "nova";

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(() => {});
        }
      }
    } catch (e) {
      console.error("TTS failed:", e);
    }
  }, [personality.gender, personality.nsfw]);

  // Генерация фото
  const generatePhoto = async (customPrompt = null) => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);

    const basePrompt = customPrompt || 
      (personality.nsfw 
        ? "очень красивая обнажённая девушка, неон, киберпанк, сексуальная поза, высокое качество" 
        : "красивая девушка, неон, киберпанк, портрет, высокое качество");

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: basePrompt, nsfw: personality.nsfw }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setMessages(m => [...m, { role: "assistant", image: url }]);
        speak("Вот твоё фото... нравится? 😏");
      }
    } catch (e) {
      console.error("Photo generation failed:", e);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // Отправка текстового сообщения
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: userMsg }], personality }),
      });

      if (res.ok) {
        const { reply } = await res.json();
        setMessages(m => [...m, { role: "assistant", content: reply }]);
        speak(reply);
      }
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Ой, что-то пошло не так... попробуй ещё раз ❤️" }]);
    } finally {
      setLoading(false);
    }
  };

  // Секретные команды (NSFW)
  useEffect(() => {
    if (!personality.nsfw || messages.length === 0) return;
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase();
    if (!lastUserMsg) return;

    if (lastUserMsg.includes("раздевайся") || lastUserMsg.includes("голая")) {
      generatePhoto("полностью обнажённая, эротическая поза, неон, высокое качество");
      speak("Ммм... да, малыш... смотри на меня... аххх...");
    } else if (lastUserMsg.includes("хочу тебя") || lastUserMsg.includes("трахни")) {
      speak("Оххх... дааа... глубже... не останавливайся!");
      generatePhoto("возбуждённая девушка, лежит на кровати, эротика");
    }
  }, [messages, personality.nsfw]);

  return (
    <div className="min-h-screen neon-bg flex flex-col">
      <audio ref={audioRef} className="hidden" />

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Neon Glow AI
              </h1>
              <p className="text-xl md:text-2xl mb-12">Твой цифровой спутник 18+</p>
              <button
                onClick={() => setStep("setup")}
                className="px-12 py-6 text-2xl rounded-full bg-gradient-to-r from-purple-600 to-pink-600 pulse-glow spotlight-hover"
              >
                Начать <Sparkles className="inline ml-3" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div key="chat" className="flex-1 flex flex-col">
            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-md px-6 py-4 rounded-3xl backdrop-blur border-2 shadow-lg ${
                      m.role === "user"
                        ? "border-white/30 bg-white/20 text-white"
                        : personality.nsfw
                          ? "border-red-500 bg-red-900/50 text-white pulse-glow"
                          : "border-pink-400 bg-pink-900/40 text-white pulse-glow"
                    }`}>
                      {m.image ? (
                        <img src={m.image} alt="AI Photo" className="rounded-2xl max-w-full" />
                      ) : (
                        m.content
                      )}
                    </div>
                  </motion.div>
                ))}
                {loading && <div className="text-center text-2xl animate-pulse">Думает...</div>}
                {generatingPhoto && <div className="text-center text-2xl animate-pulse">Генерирую фото...</div>}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Панель ввода */}
            <div className="p-4 bg-black/70 backdrop-blur-md border-t border-white/10 sticky bottom-0">
              <div className="max-w-4xl mx-auto flex gap-3 items-center">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши что-нибудь..."
                  className="flex-1 px-5 py-4 rounded-full bg-white/10 backdrop-blur border border-white/20 focus:border-pink-400 outline-none text-lg transition-all"
                />

                <button
                  onClick={() => {
                    const cmds = personality.nsfw
                      ? ["раздевайся", "стон", "хочу тебя", "трахни меня"]
                      : ["поцелуй", "обними", "ты красивая", "я скучал"];
                    setInput(cmds[Math.floor(Math.random() * cmds.length)]);
                  }}
                  className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 pulse-glow spotlight-hover"
                >
                  <Heart className="w-7 h-7" />
                </button>

                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-30 pulse-glow spotlight-hover"
                >
                  <MessageCircle className="w-7 h-7" />
                </button>

                <button
                  onClick={() => generatePhoto()}
                  disabled={generatingPhoto}
                  className="p-4 rounded-full bg-gradient-to-r from-red-600 to-pink-600 disabled:opacity-30 pulse-glow spotlight-hover"
                >
                  <Camera className="w-7 h-7" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
