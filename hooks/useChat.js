// hooks/useChat.js — ФИНАЛЬНАЯ ВЕРСИЯ С localStorage И СЕРДЕЧКАМИ

import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "neon-glow-ai-state";

export default function useChat() {
  // Загружаем из localStorage или создаём дефолт
  const loadState = () => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  };

  const initialState = loadState() || {
    step: "welcome",
    personality: {
      userGender: null,
      gender: null,
      orientation: null,
      style: null,
      nsfw: true,
    },
    messages: [],
  };

  const [step, setStep] = useState(initialState.step);
  const [personality, setPersonality] = useState(initialState.personality);
  const [messages, setMessages] = useState(initialState.messages);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [showHeart, setShowHeart] = useState(false); // ← для сердечка

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // Автосохранение при любом изменении
  useEffect(() => {
    const stateToSave = { step, personality, messages };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [step, personality, messages]);

  // Автоопределение ориентации
  useEffect(() => {
    if (!personality.userGender || !personality.gender) {
      setPersonality(p => ({ ...p, orientation: null }));
      return;
    }

    const user = personality.userGender;
    const wants = personality.gender;

    let orientation = "би";
    if (user === "Парень" && wants === "Девушка") orientation = "натурал";
    if (user === "Парень" && wants === "Парень") orientation = "гей";
    if (user === "Девушка" && wants === "Парень") orientation = "натурал";
    if (user === "Девушка" && wants === "Девушка") orientation = "лесби";

    setPersonality(p => ({ ...p, orientation }));
  }, [personality.userGender, personality.gender]);

  // При монтировании — если уже есть настройки → сразу в чат
  useEffect(() => {
    if (initialState.step === "chat" && messages.length > 0) {
      setStep("chat");
    }
  }, []);

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
    if (!text?.trim()) return;
    try {
      const res = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {}
  }, []);

  // Отправка с сердечком
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setLoading(true);

    // Сердечко летит!
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1200);

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
        arr[arr.length - 1].content = "Ой, что-то пошло не так… попробуй ещё раз";
        return arr;
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePhoto = async () => { /* ... как было ... */ };

  const undoLastMessage = () => setMessages(prev => prev.slice(0, -2));

  const resetChat = () => {
    setMessages([]);
    setStep("welcome");
    setPersonality({
      userGender: null,
      gender: null,
      orientation: null,
      style: null,
      nsfw: true,
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    step, setStep,
    personality, setPersonality,
    messages, setMessages,
    input, setInput,
    loading, generatingPhoto,
    showHeart, // ← для анимации
    messagesEndRef, audioRef,
    sendMessage, generatePhoto,
    undoLastMessage, resetChat,
  };
}
