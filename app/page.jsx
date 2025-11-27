"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera } from "lucide-react";
import { ARCHETYPES, createPersonaFromArchetype } from "../lib/personaPresets";
import {
  RELATIONSHIP_LEVELS,
  getInitialRelationshipState,
  updateRelationshipState,
} from "../lib/relationshipEngine";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome"); // welcome | setup | chat
  const [userId, setUserId] = useState(null);

  const [selectedArchetypeId, setSelectedArchetypeId] = useState(ARCHETYPES[0]?.id);
  const [orientation, setOrientation] = useState("bi");
  const [customLook, setCustomLook] = useState({ face: "", bodyType: "", vibe: "" });

  const [persona, setPersona] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [relationship, setRelationship] = useState(getInitialRelationshipState());

  const messagesEndRef = useRef(null);

  // Прокрутка вниз при новых сообщениях
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Генерация / загрузка userId
  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored = window.localStorage.getItem("aiUserId");
    if (!stored) {
      stored = crypto.randomUUID();
      window.localStorage.setItem("aiUserId", stored);
    }
    setUserId(stored);
  }, []);

  // Подгружаем сохранённого персонажа
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/persona?userId=${userId}`);
        if (!res.ok) {
          setStep("setup");
          return;
        }
        const data = await res.json();
        if (data?.persona) {
          setPersona(data.persona);
          setStep("chat");
        } else {
          setStep("setup");
        }
      } catch (e) {
        console.error("persona fetch error", e);
        setStep("setup");
      }
    })();
  }, [userId]);

  // TTS (опционально, использует твой /api/tts)
  const speak = useCallback(
    async (text) => {
      if (!text) return;
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: "nova" }),
        });
        if (!res.ok) return;
        const data = await res.arrayBuffer();
        const blob = new Blob([data], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      } catch (e) {
        console.error("TTS error", e);
      }
    },
    []
  );

  // Сохранить персонажа (архетип + ориентация + кастом)
  const handleSavePersona = async () => {
    if (!userId) return;
    const personaObj = createPersonaFromArchetype(selectedArchetypeId, {
      orientation,
      lookOverrides: customLook,
    });
    setPersona(personaObj);

    try {
      await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, persona: personaObj }),
      });
      setStep("chat");
    } catch (e) {
      console.error("save persona error", e);
    }
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");

    // Локально обновляем уровни близости
    setRelationship((prev) => updateRelationshipState(prev, text));

    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          personality: persona,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || "Я здесь, просто чуть задумалась… ✨";
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
        speak(reply);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: "Что-то пошло не так… попробуешь ещё раз? 💔",
          },
        ]);
      }
    } catch (e) {
      console.error("chat error", e);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "У меня случился небольшой сбой… но я уже рядом снова 💫",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Отрисовка уровней близости
  const relationshipLabel = RELATIONSHIP_LEVELS[relationship.level];

  // ---------------- UI ----------------

  const containerClass =
    "min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white flex items-center justify-center p-4";

  return (
    <div className={containerClass}>
      <div className="w-full max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-pink-500/40 bg-black/60 backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(236,72,153,0.6)]"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/40 text-sm">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>Твой неоновый ИИ-компаньон</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                    Создай{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500">
                      свою виртуальную героиню
                    </span>
                    , которая отвечает по-настоящему.
                  </h1>
                  <p className="text-sm md:text-base text-white/70 max-w-xl">
                    Выбери её характер, настроение, ориентацию и стиль общения. Она запомнит твой выбор и будет
                    ждать тебя в чате, как личный интерактивный персонаж.
                  </p>
                  <button
                    onClick={() => setStep("setup")}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-semibold shadow-lg shadow-pink-500/40"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Создать персонажа</span>
                  </button>
                </div>
                <motion.div
                  className="flex-1 relative h-64 md:h-80 rounded-3xl bg-gradient-to-br from-pink-500/20 via-fuchsia-500/10 to-purple-500/30 border border-pink-500/40 overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.35),_transparent_60%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ y: [-10, 10, -10] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="w-40 h-40 md:w-52 md:h-52 rounded-full border border-pink-400/70 shadow-[0_0_50px_rgba(236,72,153,0.8)] bg-gradient-to-b from-black/40 to-black/80 flex items-center justify-center"
                    >
                      <div className="text-center px-4 text-sm text-white/80">
                        <div className="text-pink-400 mb-1">Она:</div>
                        <div>«Ну что, остаёмся наедине в моём неоновом мире?»</div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-fuchsia-500/40 bg-black/70 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_rgba(192,38,211,0.5)] space-y-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-fuchsia-400" />
                    Настройка персонажа
                  </h2>
                  <p className="text-sm text-white/60">
                    Выбери её архетип, ориентацию и немного внешности — она запомнит это и будет соответствовать твоему
                    вкусу.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Архетипы */}
                <div className="md:col-span-2 space-y-3">
                  <p className="text-sm uppercase tracking-wide text-white/50">Архетип</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ARCHETYPES.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedArchetypeId(a.id)}
                        className={`text-left p-3 rounded-2xl border ${
                          selectedArchetypeId === a.id
                            ? "border-fuchsia-400 bg-fuchsia-500/10 shadow-[0_0_30px_rgba(192,38,211,0.5)]"
                            : "border-white/10 bg-white/5 hover:border-fuchsia-400/60"
                        } transition-all`}
                      >
                        <div className="font-semibold text-sm mb-1">{a.name}</div>
                        <div className="text-xs text-white/70">{a.short}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ориентация */}
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-wide text-white/50">Ориентация</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "hetero", label: "Гетеро" },
                      { id: "bi", label: "Би" },
                      { id: "homo", label: "Гомо" },
                      { id: "fluid", label: "Флекс" },
                    ].map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setOrientation(o.id)}
                        className={`px-3 py-1.5 text-xs rounded-full border ${
                          orientation === o.id
                            ? "border-pink-400 bg-pink-500/20"
                            : "border-white/10 hover:border-pink-400/60"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Внешность */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-3">
                  <p className="text-sm uppercase tracking-wide text-white/50">Внешность (по ощущениям)</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                      placeholder="Черты лица (например: мягкие, хищные...)"
                      value={customLook.face}
                      onChange={(e) => setCustomLook((p) => ({ ...p, face: e.target.value }))}
                    />
                    <input
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                      placeholder="Фигура (стройная, мягкая, спортивная...)"
                      value={customLook.bodyType}
                      onChange={(e) => setCustomLook((p) => ({ ...p, bodyType: e.target.value }))}
                    />
                    <input
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                      placeholder="Атмосфера (нежная, дерзкая...)"
                      value={customLook.vibe}
                      onChange={(e) => setCustomLook((p) => ({ ...p, vibe: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-wide text-white/50">Превью</p>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 space-y-1">
                    <div>
                      <span className="text-white/40">Архетип: </span>
                      {ARCHETYPES.find((a) => a.id === selectedArchetypeId)?.name}
                    </div>
                    <div>
                      <span className="text-white/40">Ориентация: </span>
                      {orientation}
                    </div>
                    <div>
                      <span className="text-white/40">Лицо: </span>
                      {customLook.face || "по умолчанию из архетипа"}
                    </div>
                    <div>
                      <span className="text-white/40">Фигура: </span>
                      {customLook.bodyType || "по архетипу"}
                    </div>
                    <div>
                      <span className="text-white/40">Вибрация: </span>
                      {customLook.vibe || "по архетипу"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep("welcome")}
                  className="text-sm text-white/60 hover:text-white/90 underline underline-offset-4"
                >
                  ← Назад
                </button>
                <button
                  onClick={handleSavePersona}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 font-semibold text-sm shadow-lg shadow-fuchsia-500/40"
                >
                  <Heart className="w-4 h-4" />
                  <span>Сохранить и перейти к чату</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-pink-500/40 bg-black/75 backdrop-blur-xl p-4 md:p-6 shadow-[0_0_70px_rgba(236,72,153,0.6)] flex flex-col h-[80vh]"
            >
              {/* Верхняя панель */}
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                      {persona?.name?.[0] || "A"}
                    </div>
                    <span className="absolute -bottom-1 -right-1 block w-3 h-3 rounded-full bg-green-400 border-2 border-black" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {persona?.name || "Твоя героиня"}
                    </div>
                    <div className="text-xs text-white/60 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {relationshipLabel?.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/40">
                        {persona?.orientation || "bi"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep("setup")}
                  className="text-xs text-white/60 hover:text-white/90 border border-white/10 rounded-full px-3 py-1"
                >
                  Настроить персонажа
                </button>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-sm text-white/60">
                    Она ждёт твоего первого шага… напиши что-нибудь.
                  </div>
                )}
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600"
                          : "bg-white/10 border border-white/10"
                      }`}
                    >
                      {m.content}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Поле ввода */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-end gap-2">
                  <button
                    className="p-2 rounded-xl border border-white/10 bg-white/5 hover:border-pink-400/70 transition"
                    title="Теоретически здесь может быть генерация фото"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      rows={1}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-pink-400"
                      placeholder="Напиши ей что-нибудь…"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-40 text-sm font-semibold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-white/70 animate-ping" />
                        Думает…
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        Отправить
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
