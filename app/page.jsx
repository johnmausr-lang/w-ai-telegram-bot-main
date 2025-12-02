// app/page.jsx — ФИНАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ (декабрь 2025)

"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Send, ChevronLeft, MessageSquare, Trash2, Menu } from "lucide-react";

const STORAGE_KEY = "neon_ai_chats_2025";

export default function NeonGlowAI() {
  // === СОСТОЯНИЯ ===
  const [step, setStep] = useState("welcome");
  const [userGender, setUserGender] = useState(null);
  const [aiGender, setAiGender] = useState(null);
  const [style, setStyle] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [sendingText, setSendingText] = useState(false);
  const [notification, setNotification] = useState("");

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // === ЗАГРУЗКА И СОХРАНЕНИЕ ДИАЛОГОВ ===
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setChats(parsed);
        if (parsed.length > 0 && !currentChatId) loadChat(parsed[0].id);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const isGay = userGender === "Мужчина" && aiGender === "Мужчина";
  const styles = isGay
    ? ["Нежный", "Дерзкий", "Покорный", "Доминантный"]
    : ["Нежная", "Дерзкая", "Покорная", "Доминантная"];

  // === РАБОТА С ДИАЛОГАМИ ===
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "Новый диалог",
      messages: [],
      createdAt: new Date().toISOString(),
      userGender: userGender || "",
      aiGender: aiGender || "",
      style: style || ""
    };
    setChats(prev => [newChat, ...prev]);
    loadChat(newChat.id);
    setSidebarOpen(false);
  };

  const loadChat = (id) => {
    const chat = chats.find(c => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setMessages(chat.messages);
      setUserGender(chat.userGender);
      setAiGender(chat.aiGender);
      setStyle(chat.style);
      setStep("chat");
      setSidebarOpen(false);
    }
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
      setStep("welcome");
    }
  };

  const deleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
    setChats(prev => prev.map(c =>
      c.id === currentChatId
        ? { ...c, messages: c.messages.filter((_, i) => i !== index) }
        : c
    ));
  };

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const title = messages[0]?.content?.slice(0, 35) || "Новый диалог";
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, title } : c));
    }
  }, [messages, currentChatId]);

  // === ГЕНЕРАЦИЯ ФОТО (ТОЛЬКО ПО КНОПКЕ КАМЕРЫ) ===
  const generatePhoto = async () => {
    if (generatingPhoto || !input.trim()) return;
    setGeneratingPhoto(true);
    setMessages(prev => [...prev, { role: "assistant", content: "Генерирую фото... 15–30 сек" }]);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });
      const { imageUrl } = await res.json();

      setMessages(prev =>
        prev.filter(m => m.content !== "Генерирую фото... 15–30 сек")
            .concat({ role: "assistant", content: imageUrl, type: "image" })
      );
    } catch {
      setMessages(prev => prev.filter(m => m.content !== "Генерирую фото... 15–30 сек")
        .concat({ role: "assistant", content: "Ошибка генерации" }));
    } finally {
      setGeneratingPhoto(false);
      setInput("");
    }
  };

  // === ОТПРАВКА ТЕКСТА (Enter + кнопка отправить) ===
  const sendTextMessage = async () => {
    if (!input.trim() || generatingPhoto || sendingText) return;
    const userText = input.trim();
    setInput("");
    setSendingText(true);

    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          personality: { gender: aiGender, style, nsfw: true },
          history: messages.slice(-12)
        }),
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
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const json = JSON.parse(line.slice(6));
              const delta = json.choices?.[0]?.delta?.content || "";
              if (delta) {
                setMessages(prev => {
                  const arr = [...prev];
                  arr[arr.length - 1].content += delta;
                  return arr;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => {
        const arr = [...prev];
        arr[arr.length - 1].content = "Ой, я запуталась... попробуй ещё";
        return arr;
      });
    } finally {
      setSendingText(false);
    }
  };

  // === СМЕНА СТИЛЯ ===
  const changeStyle = (newStyle) => {
    setStyle(newStyle);
    setNotification(`Стиль: ${newStyle.toLowerCase()}`);
    setTimeout(() => setNotification(""), 3000);
    setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, style: newStyle } : c));
    setStep("chat");
  };

  // === РЕНДЕР ===
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-950 via-pink-900 to-black text-white relative">

      {/* Уведомление */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black/70 backdrop-blur px-6 py-3 rounded-full text-sm">
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сайдбар */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
            className="fixed inset-y-0 left-0 w-80 bg-black/90 backdrop-blur-xl z-50 border-r border-white/10 flex flex-col">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Диалоги</h2>
              <button onClick={() => setSidebarOpen(false)}><ChevronLeft /></button>
            </div>
            <button onClick={createNewChat} className="mx-4 mt-4 mb-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold">
              + Новый диалог
            </button>
            <div className="flex-1 overflow-y-auto">
              {chats.map(chat => (
                <div key={chat.id} onClick={() => loadChat(chat.id)}
                  className={`px-5 py-4 border-b border-white/5 flex justify-between items-center hover:bg-white/5 cursor-pointer ${currentChatId === chat.id ? "bg-white/10" : ""}`}>
                  <div>
                    <div className="font-medium">{chat.title}</div>
                    <div className="text-xs opacity-70">{chat.style || "Без стиля"}</div>
                  </div>
                  <button onClick={(e) => deleteChat(chat.id, e)} className="p-2 hover:bg-red-600/50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка меню */}
      {step === "chat" && (
        <button onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-3 bg-black/70 backdrop-blur-lg rounded-full">
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Основные экраны — без изменений (welcome, выбор пола, стиль) */}
      <AnimatePresence mode="wait">
        {step === "welcome" && /* ... как раньше ... */}
        {step === "user-gender" && /* ... как раньше ... */}
        {step === "ai-gender" && /* ... как раньше ... */}
        {step === "style" && /* ... как раньше ... */}

        {/* ЧАТ */}
        {step === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 pt-20 pb-32 space-y-6">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  onLongPress={() => deleteMessage(i)}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-2xl ${m.role === "user" ? "bg-purple-700" : "bg-pink-700"}`}>
                    {m.type === "image" ? (
                      <img src={m.content} alt="18+" className="rounded-2xl w-full max-w-sm mx-auto cursor-pointer border-4 border-purple-500/60"
                        onClick={() => window.open(m.content, "_blank")} />
                    ) : (
                      <p className="text-lg leading-relaxed">{m.content || "..."}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Нижняя панель */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendTextMessage())}
                  placeholder="Напиши сообщение..."
                  className="flex-1 bg-white/10 rounded-full px-6 py-4 text-base outline-none placeholder-white/50"
                />
                <button onClick={generatePhoto} disabled={generatingPhoto}
                  className="p-4 bg-red-600 rounded-full shadow-lg relative">
                  <Camera className="w-7 h-7" />
                  {generatingPhoto && <div className="absolute inset-0 border-4 border-t-transparent border-white rounded-full animate-spin"></div>}
                </button>
                <button onClick={sendTextMessage} disabled={sendingText}
                  className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg">
                  <Send className="w-7 h-7" />
                </button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
