// hooks/useChat.js — ПОЛНЫЙ ИСПРАВЛЕННЫЙ КОД (декабрь 2025)

import { useState, useEffect, useRef, useCallback } from "react";

export default function useChat() {
  const [step, setStep] = useState("welcome");

  const [personality, setPersonality] = useState({
    userGender: null,      // Кто сам пользователь: "Парень" | "Девушка" | "Другое"
    gender: null,          // Кого хочет: "Девушка" | "Парень"
    orientation: null,     // Автоматически вычисляется ниже
    style: null,
    nsfw: true,
  });

  // Автоматически определяем ориентацию при изменении userGender или gender
  useEffect(() => {
    if (!personality.userGender || !personality.gender) {
      setPersonality(p => ({ ...p, orientation: null }));
      return;
    }

    const user = personality.userGender;
    const wants = personality.gender;

    let orientation = "би"; // по умолчанию — если "Другое" или сложные комбинации

    if (user === "Парень" && wants === "Девушка") orientation = "натурал";
    if (user === "Парень" && wants === "Парень") orientation = "гей";
    if (user === "Девушка" && wants === "Парень") orientation = "натурал";
    if (user === "Девушка" && wants === "Девушка") orientation = "лесби";

    setPersonality(p => ({ ...p, orientation }));
  }, [personality.userGender, personality.gender]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // Автоскролл
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // === TTS ===
  const speak = useCallback(async (text) => {
    if (!text?.trim()) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {}
  }, []);

  // === Отправка сообщения ===
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
        arr[arr.length - 1].content = "Ой, что-то пошло не так… попробуй ещё раз";
        return arr;
      });
    } finally {
      setLoading(false);
    }
  };

  // === Генерация фото ===
  const generatePhoto = async () => {
    if (generatingPhoto || !input.trim()) return;
    setGeneratingPhoto(true);

    setMessages(prev => [...prev, { role: "assistant", content: "Генерирую горячее фото... (15–25 сек)" }]);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      const { imageUrl } = await res.json();

      setMessages(prev =>
        prev
          .filter(m => m.content !== "Генерирую горячее фото... (15–25 сек)")
          .concat({ role: "assistant", content: imageUrl, type: "image" })
      );
    } catch (e) {
      setMessages(prev =>
        prev
          .filter(m => m.content !== "Генерирую горячее фото... (15–25 сек)")
          .concat({ role: "assistant", content: "Не получилось… попробуй другой запрос ❤️" })
      );
    } finally {
      setGeneratingPhoto(false);
    }
  };

  // === Управление чатом ===
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
  };

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
    messagesEndRef,
    audioRef,
    sendMessage,
    generatePhoto,
    undoLastMessage,
    resetChat,
  };
}
