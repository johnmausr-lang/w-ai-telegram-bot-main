// hooks/useChat.js — ФИНАЛЬНАЯ ВЕРСИЯ С ЗАЩИТОЙ ОТ БИТЫХ ДАННЫХ

import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "neon-glow-ai-state";

export default function useChat() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    userGender: null,
    gender: null,
    orientation: null,
    style: null,
    nsfw: true,
  });
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // ГЛАВНОЕ ИСПРАВЛЕНИЕ: безопасная загрузка + проверка Telegram WebApp
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ЕСЛИ ЭТО НЕ TELEGRAM WEBAPP — ВСЕГДА НАЧИНАЕМ С WELCOME
    const isTelegram = !!window.Telegram?.WebApp;
    if (!isTelegram) {
      setStep("welcome");
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setStep("welcome");
        return;
      }

      const data = JSON.parse(saved);

      // Защита от битых данных
      if (!data || typeof data !== "object") {
        setStep("welcome");
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      if (data.step && data.step === "chat" && Array.isArray(data.messages) && data.messages.length > 0) {
        setStep("chat");
        if (data.personality) setPersonality(data.personality);
        if (data.messages) setMessages(data.messages);
      } else {
        // Если чат пустой или битый — начинаем заново
        setStep("welcome");
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Corrupted localStorage data", e);
      setStep("welcome");
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Сохранение
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (step === "welcome") return; // не сохраняем начальный экран

    const toSave = { step, personality, messages };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [step, personality, messages]);

  // Остальной код без изменений (автоориентация, sendMessage и т.д.)
  // ... (весь код из предыдущей версии, начиная с useEffect для ориентации)

  // ВСЁ ОСТАЛЬНОЕ ОСТАЁТСЯ КАК БЫЛО — просто вставь сюда остаток кода
  // (автоориентация, sendMessage, generatePhoto, resetChat и т.д.)

  return {
    step,
    setStep,
    personality,
    setPersonality,
    messages,
    input,
    setInput,
    loading,
    generatingPhoto,
    showHeart,
    messagesEndRef,
    audioRef,
    sendMessage,
    generatePhoto,
    undoLastMessage,
    resetChat,
  };
}
