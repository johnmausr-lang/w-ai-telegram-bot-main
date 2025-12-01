"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: "Женщина",
    orientation: "натурал",
    style: "нежная", // нежная | дерзкая | покорная | доминантная
    nsfw: true,
  });
  const [messages, setMessages] = useState([]); // [{ role: "user" | "assistant", content: string }]
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

  // TTS (оставляем как есть)
  const speak = useCallback(async (text) => {
    if (!text) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: personality.nsfw ? "shimmer" : "nova" }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {}
  }, [personality.nsfw]);

  // ГЛАВНАЯ ФУНКЦИЯ — ИСПРАВЛЕННЫЙ СТРИМИНГ БЕЗ ОШИБОК
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          personality,
          history: messages,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let line of lines) {
          line = line.trim();
          if (!line || line === "data: [DONE]") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            const delta = data.choices?.[0]?.delta?.content || "";
            if (delta) {
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1].content += delta;
                return copy;
              });
            }
          } catch (e) {
            console.warn("Пропущена битая строка:", line);
          }
        }
      }

      // Озвучка финального ответа
      const finalReply = messages[messages.length - 1]?.content || "";
      if (finalReply) speak(finalReply);

    } catch (err) {
      console.error("Send error:", err);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1].content = "Ой, я запуталась… попробуй ещё раз";
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  const undoLastMessage = () => {
    if (messages.length < 2) return;
    setMessages(prev => prev.slice(0, -2));
  };

  const resetChat = () => {
    setMessages([]);
    setStep("welcome");
  };

  const generatePhoto = async () => {
    setGeneratingPhoto(true);
    try {
      const res = await fetch("/api/image", { method: "POST", body: JSON.stringify({ prompt: "эротическая обнажённая девушка в неоне" }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.imageUrl ? `[Фото] ${data.imageUrl}` : "Фото готово!" }]);
    } catch (e) {}
    setGeneratingPhoto(false);
  };

  return (
    <div className="min-h-screen flex flex-col neon-bg relative overflow-hidden">
      <audio ref={audioRef} />

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Твой AI</h1>
            <p className="text-2xl mt-4">18+ компаньон</p>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep("chat")} className="mt-12 px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold">
              Начать
            </motion.button>
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-screen">
            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-xs md:max-w-md px-5 py-3 rounded-3xl text-lg ${
                    msg.role === "user" ? "ml-auto bg-purple-600 text-white" : "mr-auto bg-pink-600 text-white"
                  }`}
                >
                  {msg.content || "..."}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Панель ввода */}
            <div className="p-4 bg-gradient-to-t from-black/90 via-black/50">
              <div className="flex gap-3 items-center mb-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши..."
                  rows={1}
                  className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 focus:border-pink-500 outline-none resize-none"
                />
                <button onClick={() => setInput(personality.nsfw ? "хочу тебя..." : "приветик")} className="p-3 rounded-full bg-pink-600">
                  <Heart className="w-6 h-6" />
                </button>
                <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-3 rounded-full bg-purple-600 disabled:opacity-50">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-3 rounded-full bg-red-600">
                  <Camera className="w-6 h-6" />
                </button>
              </div>

              {/* Кнопки управления */}
              <div className="flex justify-center gap-4">
                <button onClick={undoLastMessage} className="px-6 py-2 bg-red-600/80 rounded-xl hover:bg-red-500 transition">
                  ← Назад
                </button>
                <button onClick={resetChat} className="px-6 py-2 bg-purple-600/80 rounded-xl hover:bg-purple-500 transition">
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
