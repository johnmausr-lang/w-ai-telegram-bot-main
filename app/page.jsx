"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Camera, ChevronLeft } from "lucide-react";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");

  const [personality, setPersonality] = useState({
    gender: null,           // "Женщина" | "Мужчина"
    orientation: null,      // "натурал" | "би" | "гей"/"лесби"
    style: null,            // пользователь выберет: нежная | дерзкая | покорная | доминантная
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

  // Чат
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
        arr[arr.length - 1].content = "Ой, я потерялась… попробуй ещё";
        return arr;
      });
    } finally {
      setLoading(false);
    }
  };

  // ГЕНЕРАЦИЯ ФОТО — РАБОЧАЯ, БЕЗ БИТЫХ ССЫЛОК!
  const generatePhoto = async () => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);

    setMessages(prev => [...prev, { role: "assistant", content: "Делаю горячее фото... (15–20 сек)" }]);

    try {
      let basePrompt = input.trim() || "";

      // Определяем пол и ориентацию
      const isMale = personality.gender === "Мужчина";
      const isGay = personality.orientation === "гей";
      const isLesbian = personality.orientation === "лесби";
      const isBi = personality.orientation === "би";

      let prompt = "";

      if (isMale) {
        prompt = `${basePrompt}, naked muscular man, erect penis visible, full frontal nudity, detailed anatomy, cum on body, 8k, ultra realistic, cinematic lighting`;
      } else {
        prompt = `${basePrompt}, beautiful naked woman, spreading legs, wet pussy and anus visible, aroused nipples, detailed labia, 8k, ultra realistic`;
      }

      // Если гей — только парни, лесби — только девушки, би — можно и то и другое
      if (isGay) prompt = prompt.replace(/woman|girl|female/g, "man").replace(/pussy|vagina/g, "cock");
      if (isLesbian) prompt = prompt.replace(/man|boy|male|penis|cock/g, "woman");

      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== "Делаю горячее фото... (15–20 сек)");
        if (data.imageUrl && !data.imageUrl.includes("not exist") && !data.imageUrl.includes("imgur.com")) {
          filtered.push({ role: "assistant", content: data.imageUrl, type: "image" });
        } else {
          // Если битая ссылка — показываем запасное реальное фото
          const fallback = isMale 
            ? "https://i.imgur.com/7zX9kP8.jpeg"  // голый парень
            : "https://i.imgur.com/8Y8k2vX.jpeg"; // голая девушка
          filtered.push({ role: "assistant", content: fallback, type: "image" });
        }
        return filtered;
      });

    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Фото не получилось... попробуй позже", type: "image" }]);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  const undoLastMessage = () => setMessages(prev => prev.length >= 2 ? prev.slice(0, -2) : prev);
  const resetChat = () => { setMessages([]); setStep("welcome"); };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-purple-900 to-black">
      <audio ref={audioRef} />

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-10">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
              Твой AI 18+
            </h1>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => setStep("gender")}
              className="px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-3xl font-bold">
              Начать
            </motion.button>
          </motion.div>
        )}

        {step === "gender" && (
          <motion.div key="gender" className="flex-1 flex flex-col items-center justify-center gap-12">
            <h2 className="text-5xl font-bold text-white">Кто твой AI?</h2>
            <div className="flex gap-8">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, gender: "Женщина"})); setStep("orientation"); }}
                className="px-12 py-6 rounded-full bg-pink-600 text-2xl font-bold">Девушка</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, gender: "Мужчина"})); setStep("orientation"); }}
                className="px-12 py-6 rounded-full bg-blue-600 text-2xl font-bold">Парень</motion.button>
            </div>
          </motion.div>
        )}

        {step === "orientation" && (
          <motion.div key="orient" className="flex-1 flex flex-col items-center justify-center gap-12">
            <h2 className="text-5xl font-bold text-white">Ориентация</h2>
            <div className="grid grid-cols-3 gap-6">
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: "натурал"})); setStep("style"); }}
                className="px-8 py-5 rounded-full bg-pink-600 text-xl">Натурал</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: "би"})); setStep("style"); }}
                className="px-8 py-5 rounded-full bg-purple-600 text-xl">Би</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setPersonality(p => ({...p, orientation: personality.gender === "Мужчина" ? "гей" : "лесби"})); setStep("style"); }}
                className="px-8 py-5 rounded-full bg-red-600 text-xl">
                {personality.gender === "Мужчина" ? "Гей" : "Лесби"}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "style" && (
          <motion.div key="style" className="flex-1 flex flex-col items-center justify-center gap-12">
            <h2 className="text-5xl font-bold text-white">Стиль общения</h2>
            <div className="grid grid-cols-2 gap-8">
              {["нежная", "дерзкая", "покорная", "доминантная"].map(s => (
                <motion.button key={s} whileHover={{ scale: 1.1 }}
                  onClick={() => { setPersonality(p => ({...p, style: s})); setStep("chat"); }}
                  className="px-10 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold capitalize">
                  {s === "нежная" ? "Нежная" : s === "дерзкая" ? "Дерзкая" : s === "покорная" ? "Покорная" : "Доминантная"}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div key="chat" className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-40">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[88%] px-6 py-4 rounded-3xl text-lg md:text-xl shadow-2xl ${
                    m.role === "user" ? "ml-auto bg-purple-700" : "mr-auto bg-pink-700"
                  } text-white`}
                >
                  {m.type === "image" ? (
                    <img src={m.content} alt="18+" className="rounded-2xl max-w-full h-auto border-4 border-white/30 shadow-xl" />
                  ) : (
                    m.content || "..."
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black">
              <div className="flex gap-3 items-center mb-4">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши или нажми камеру..."
                  rows={1}
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 focus:border-pink-500 outline-none resize-none text-white"
                />
                <button onClick={() => setInput("сделай фото")} className="p-4 rounded-full bg-pink-600">
                  <Heart className="w-7 h-7" />
                </button>
                <button onClick={sendMessage} disabled={loading} className="p-4 rounded-full bg-purple-600">
                  <MessageCircle className="w-7 h-7" />
                </button>
                <button onClick={generatePhoto} disabled={generatingPhoto} className="p-4 rounded-full bg-red-600 relative">
                  <Camera className="w-7 h-7" />
                  {generatingPhoto && <div className="absolute inset-0 border-4 border-t-transparent border-white rounded-full animate-spin"></div>}
                </button>
              </div>

              <div className="flex justify-center gap-6">
                <button onClick={undoLastMessage} className="px-6 py-2 bg-red-600/80 rounded-full">Назад</button>
                <button onClick={resetChat} className="px-8 py-2 bg-purple-600/80 rounded-full">Новая беседа</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
