"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState({
    gender: "Женщина",
    mode: "flirt",
    nsfw: true,
  });

  const [generatedImage, setGeneratedImage] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ========== Отправка сообщений ==========
  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMsg = { role: "user", content: message };
    setChat((c) => [...c, userMsg]);
    const current = message;
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: current, personality }),
      });

      const data = await res.json();
      const reply = data.reply ?? "...";

      setChat((c) => [...c, { role: "assistant", content: reply }]);
      playTTS(reply);
    } catch (err) {
      setChat((c) => [
        ...c,
        { role: "assistant", content: "Ошибка… но я рядом ❤️" },
      ]);
    }

    setLoading(false);
  }

  // ========== Голос (TTS) ==========
  async function playTTS(text) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const buffer = await res.arrayBuffer();

      const audio = new Audio(URL.createObjectURL(new Blob([buffer])));
      audio.play();
    } catch {}
  }

  // ========== Генерация изображения ==========
  async function generateImage() {
    setImgLoading(true);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "beautiful neon portrait girl 2025 style",
          personality,
        }),
      });
      const data = await res.json();
      setGeneratedImage(`data:image/png;base64,${data.image}`);
    } finally {
      setImgLoading(false);
    }
  }

  // ========== UI ==========
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden text-white flex items-center justify-center">

      {/* ----- АНИМИРОВАННЫЕ ЧАСТИЦЫ ФОНА ----- */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-pink-500 rounded-full blur-md"
            initial={{
              x: Math.random() * 800 - 400,
              y: Math.random() * 800 - 400,
              scale: Math.random() * 1.5,
            }}
            animate={{
              x: Math.random() * 800 - 400,
              y: Math.random() * 800 - 400,
              scale: Math.random() * 1.5,
            }}
            transition={{
              duration: 12 + Math.random() * 10,
              repeat: Infinity,
              ease: "ease-in-out",
            }}
          />
        ))}
      </div>

      {/* ----- ОКНО ----- */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-6"
      >
        {/* ---------- Персонаж ---------- */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">Neon Glow AI</h1>
            <p className="text-sm text-white/60">Твой цифровой спутник</p>
          </div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            className="rounded-2xl bg-white/10 px-4 py-2 border border-white/20 shadow-lg"
          >
            <select
              className="bg-transparent outline-none text-white text-sm"
              value={personality.gender}
              onChange={(e) =>
                setPersonality((p) => ({ ...p, gender: e.target.value }))
              }
            >
              <option>Женщина</option>
              <option>Мужчина</option>
              <option>Нейтральный</option>
            </select>
          </motion.div>
        </div>

        {/* ---------- ЧАТ ---------- */}
        <div className="h-[55vh] overflow-y-auto pr-2 space-y-4 mb-4">
          <AnimatePresence>
            {chat.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-3 max-w-[80%] rounded-2xl text-sm tracking-wide backdrop-blur-xl ${
                    msg.role === "user"
                      ? "bg-pink-500 text-black font-medium shadow-xl"
                      : "bg-white/10 border border-white/10 shadow-xl"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={endRef} />
        </div>

        {/* ---------- ВВОД СООБЩЕНИЯ ---------- */}
        <div className="flex gap-3">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl outline-none text-sm placeholder-white/40"
            placeholder="Напиши что-нибудь…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            className="px-5 py-3 bg-pink-600 rounded-2xl shadow-lg text-sm font-semibold"
          >
            {loading ? "..." : "Отпр."}
          </motion.button>
        </div>

        {/* ---------- КНОПКА ГЕНЕРАЦИИ ИЗОБРАЖЕНИЙ ---------- */}
        <div className="flex flex-col items-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={generateImage}
            className="px-6 py-3 bg-purple-600 rounded-2xl shadow-xl font-medium"
          >
            {imgLoading ? "Генерация…" : "Создать изображение"}
          </motion.button>

          {generatedImage && (
            <motion.img
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              src={generatedImage}
              className="w-full mt-6 rounded-3xl shadow-2xl border border-white/10"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
