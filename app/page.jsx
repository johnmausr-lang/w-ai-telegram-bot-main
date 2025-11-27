"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const [personality, setPersonality] = useState({
    gender: "Женщина",
    mode: "flirt",
    nsfw: true,
  });

  const [imgLoading, setImgLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // === ОТПРАВКА ТЕКСТА В ЧАТ ===
  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMsg = { role: "user", content: message };
    setChat((prev) => [...prev, userMsg]);

    const currentMessage = message;
    setMessage("");

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          personality,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Я задумалась…";

      setChat((prev) => [...prev, { role: "assistant", content: reply }]);
      ttsSpeak(reply);
    } catch (e) {
      console.error(e);
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Произошла ошибка, но я рядом ❤️" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // === TTS: озвучка ответа ===
  async function ttsSpeak(text) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) return;
      const audioData = await res.arrayBuffer();
      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (e) {
      console.error("TTS ERR:", e);
    }
  }

  // === Генерация изображения ===
  async function generateImage() {
    if (imgLoading) return;

    setImgLoading(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "portrait of beautiful girl, soft neon light, cinematic glow",
          personality,
        }),
      });

      const data = await res.json();
      if (data.image) {
        setGeneratedImage(`data:image/png;base64,${data.image}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImgLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">
        Neon Glow AI — Твой персональный ИИ
      </h1>

      {/* === ПАНЕЛЬ НАСТРОЕК ПЕРСОНАЖА === */}
      <div className="w-full max-w-xl bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
        <h2 className="text-lg font-semibold mb-2">Настройки персонажа</h2>

        <div className="flex flex-col gap-3">
          {/* Пол */}
          <div>
            <label className="text-sm">Пол:</label>
            <select
              className="bg-black border border-white/20 rounded px-3 py-1 w-full text-sm"
              value={personality.gender}
              onChange={(e) =>
                setPersonality((p) => ({ ...p, gender: e.target.value }))
              }
            >
              <option>Женщина</option>
              <option>Мужчина</option>
              <option>Нейтральный</option>
            </select>
          </div>

          {/* Режим */}
          <div>
            <label className="text-sm">Режим общения:</label>
            <select
              className="bg-black border border-white/20 rounded px-3 py-1 w-full text-sm"
              value={personality.mode}
              onChange={(e) =>
                setPersonality((p) => ({ ...p, mode: e.target.value }))
              }
            >
              <option value="flirt">Флирт</option>
              <option value="friendly">Дружеский</option>
            </select>
          </div>

          {/* NSFW */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={personality.nsfw}
              onChange={(e) =>
                setPersonality((p) => ({ ...p, nsfw: e.target.checked }))
              }
            />
            <span className="text-sm">NSFW (мягко допустимое)</span>
          </div>
        </div>
      </div>

      {/* === ЧАТ === */}
      <div className="w-full max-w-xl flex flex-col flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {chat.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  m.role === "user"
                    ? "bg-pink-500 text-black font-semibold"
                    : "bg-white/10 border border-white/10"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          <div ref={endRef} />
        </div>

        {/* === ОТПРАВКА СООБЩЕНИЯ === */}
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 bg-black border border-white/20 rounded-xl px-3 py-2 text-sm"
            placeholder="Напиши сообщение…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-4 py-2 bg-pink-600 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? "..." : "▶"}
          </button>
        </div>
      </div>

      {/* === БЛОК ГЕНЕРАЦИИ ИЗОБРАЖЕНИЙ === */}
      <div className="w-full max-w-xl bg-white/5 p-4 mt-6 rounded-xl border border-white/10 flex flex-col items-center">
        <h2 className="font-semibold mb-3">Генерация изображения</h2>

        <button
          onClick={generateImage}
          disabled={imgLoading}
          className="px-5 py-2 bg-purple-600 rounded-xl mb-4"
        >
          {imgLoading ? "Генерирую…" : "Создать изображение"}
        </button>

        {generatedImage && (
          <img
            src={generatedImage}
            alt="Generated"
            className="rounded-xl shadow-xl border border-white/20 w-full"
          />
        )}
      </div>
    </div>
  );
}
