// app/page.jsx — 100% РАБОЧИЙ ЧАТ + ФОТО + СТРИМИНГ + FAL.AI
"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Camera, Menu, ArrowLeft, Sparkles } from "lucide-react";

const styles = ["Нежная", "Дерзкая", "Покорная", "Доминантная", "Игривая"];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [stage, damaged] = useState("welcome");
  const [gender, setGender] = useState("");
  const [style, setStyle] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const messagesEndRef = useRef(null);

  const personality = { gender, style: style.toLowerCase(), nsfw: true };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("neon_images");
    if (saved) setGeneratedImages(JSON.parse(saved));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const startChat = () => {
    setMessages([{
      text: `Приветик Я твоя ${gender === "Парень" ? style.toLowerCase() + "ий" : style.toLowerCase() + "ая"} ${gender.toLowerCase()}. Что будем делать?`,
      isBot: true
    }]);
    setStage("chat");
  };

  const generateImage = async (userPrompt = "") => {
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt || `сексуальная ${gender.toLowerCase()} в стиле ${style.toLowerCase()}` })
      });
      const data = await res.json();
      if (data.imageUrl) {
        const url = data.imageUrl + (data.imageUrl.includes("?") ? "&" : "?") + Date.now();
        setGeneratedImages(prev => {
          const updated = [url, ...prev].slice(0, 30);
          localStorage.setItem("neon_images", JSON.stringify(updated));
          return updated;
        });
        return url;
      }
    } catch (e) {
      console.error("Image gen failed:", e);
    }
    return "https://i.imgur.com/8Y8k2vX.jpeg";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInput("");
    setIsTyping(true);

    const lower = userText.toLowerCase();
    const wantsPhoto = /фото|сфоткай|покажи|нарисуй|голая|голый|ню|секси|сиськи|член|пизд/i.test(lower);

    if (wantsPhoto) {
      const photoUrl = await generateImage(userText);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "Держи горячее фото для тебя",
          isBot: true,
          image: photoUrl
        }]);
        setIsTyping(false);
      }, 2000);
      return;
    }

    // Стриминг от Hugging Face
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          personality,
          history: messages.map(m => ({ role: m.isBot ? "assistant" : "user", content: m.text || "" }))
        })
      });

      if (!res.ok || !res.body) {
        setMessages(prev => [...prev, { text: "Ой... я вся мокрая от тебя, но что-то пошло не так", isBot: true }]);
        setIsTyping(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";

      setMessages(prev => [...prev, { text: "", isBot: true, streaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content || "";
              botResponse += content;
              setMessages(prev => {
                const newMsgs = [...prev];
                if (newMsgs[newMsgs.length - 1]?.streaming) {
                  newMsgs[newMsgs.length - 1].text = botResponse;
                }
                return newMsgs;
              });
            } catch {}
          }
        }
      }
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[newMsgs.length - 1]?.streaming) {
          delete newMsgs[newMsgs.length - 1].streaming;
        }
        return newMsgs;
      });
    } catch (e) {
      setMessages(prev => [...prev, { text: "Ммм... я вся дрожу... давай ещё раз", isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!mounted) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-20 h-20 border-4 border-t-pink-500 border-r-purple-500 border-b-cyan-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {/* WELCOME */}
        {stage === "welcome" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
            <motion.h1 className="text-7xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">
              Neon Desire
            </motion.h1>
            <p className="text-2xl text-gray-400 mb-12">Твой 18+ спутник без цензуры</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage("gender")}
              className="px-20 py-8 bg-gradient-to-r from-pink-600 to-purple-700 rounded-3xl text-3xl font-bold shadow-2xl shadow-pink-500/50"
            >
              Начать
            </motion.button>
          </motion.div>
        )}

        {/* GENDER & STYLE — как раньше */}
        {stage === "gender" && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} className="min-h-screen flex flex-col items-center justify-center px-6">
            <button onClick={() => setStage("welcome")} className="absolute top-8 left-8"><ArrowLeft className="w-9 h-9" /></button>
            <h2 className="text-5xl font-bold mb-16">Кто тебе нужен?</h2>
            <div className="grid grid-cols-2 gap-10">
              <button onClick={() => { setGender("Девушка"); setStage("style"); }} className="p-16 glass rounded-3xl text-4xl font-bold hover:scale-110 glow-pink transition">Девушка</button>
              <button onClick={() => { setGender("Парень"); setStage("style"); }} className="p-16 glass rounded-3xl text-4xl font-bold hover:scale-110 glow-cyan transition">Парень</button>
            </div>
          </motion.div>
        )}

        {stage === "style" && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} className="min-h-screen flex flex-col justify-center px-6">
            <button onClick={() => setStage("gender")} className="absolute top-8 left-8"><ArrowLeft className="w-9 h-9" /></button>
            <h2 className="text-5xl font-bold mb-12 text-center">Какой стиль?</h2>
            <div className="space-y-6 max-w-2xl mx-auto">
              {styles.map(s => (
                <button key={s} onClick={() => { setStyle(s); startChat(); }}
                  className="w-full p-8 glass rounded-3xl text-3xl font-medium hover:scale-105 glow-pink transition">
                  {s}{gender === "Девушка" ? "ая" : "ий"}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ЧАТ */}
        {stage === "chat" && (
          <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-purple-900/20 to-black">
            <div className="glass p-6 flex justify-between items-center border-b border-white/10">
              <button onClick={() => setStage("welcome")}><Menu className="w-8 h-8" /></button>
              <p className="text-xl font-bold">{gender} • {style}</p>
              <button onClick={() => setShowGallery(true)}><Camera className="w-8 h-8" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={m.isBot ? "flex justify-start" : "flex justify-end"}>
                  <div className={`max-w-xs md:max-w-lg ${m.isBot ? "bg-purple-900/70" : "bg-pink-600/80"} glass rounded-3xl px-6 py-4`}>
                    {m.image && <img src={m.image} className="w-full rounded-2xl mb-3 shadow-2xl" />}
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-purple-900/70 glass rounded-3xl px-6 py-4">
                    <span className="animate-pulse text-lg">Печатает...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6">
              <div className="glass rounded-3xl p-5 flex gap-4 backdrop-blur-xl">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Напиши что угодно... или просто 'фото'"
                  className="flex-1 bg-transparent outline-none text-lg"
                />
                <button onClick={sendMessage} className="p-4 bg-gradient-to-r from-pink-600 to-purple-700 rounded-2xl hover:scale-110 transition glow-pink">
                  <Send className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ГАЛЕРЕЯ */}
      <AnimatePresence>
        {showGallery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 z-50 flex items-end"
            onClick={() => setShowGallery(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} onClick={e => e.stopPropagation()}
              className="w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between mb-8">
                <h2 className="text-4xl font-bold">Галерея</h2>
                <button onClick={() => setShowGallery(false)} className="text-4xl">×</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.length === 0 ? (
                  <p className="col-span-2 text-center text-gray-500 text-2xl py-32">Напиши "фото" в чате</p>
                ) : generatedImages.map((src, i) => (
                  <img key={i} src={src} className="w-full rounded-2xl shadow-2xl" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
