"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Send, ChevronLeft, MessageSquare, Trash2, Menu } from "lucide-react";

const STORAGE_KEY = "neon_ai_chats_2025";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome"); // welcome → user-gender → ai-gender → style → chat
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

  // === localStorage ===
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
    if (chats.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

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

  // === ДИАЛОГИ ===
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
      c.id === currentChatId ? { ...c, messages: c.messages.filter((_, i) => i !== index) } : c
    ));
  };

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const title = messages[0]?.content?.slice(0, 35) || "Новый диалог";
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, title } : c));
    }
  }, [messages, currentChatId]);

  // === ГЕНЕРАЦИЯ ФОТО ===
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

  // === ОТПРАВКА ТЕКСТА ===
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
              <button onClick={() => setSidebarOpen(false)}><ChevronLeft className="w-6 h-6" /></button>
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

      {/* Верхняя панель */}
      {step !== "welcome" && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-black/70 backdrop-blur-lg border-b border-white/10 p-4 flex justify-between items-center">
          <button onClick={() => {
            if (step === "chat") setStep("style");
            else if (step === "style") setStep("ai-gender");
            else if (step === "ai-gender") setStep("user-gender");
            else if (step === "user-gender") setStep("welcome");
          }} className="flex items-center gap-2 px-5 py-2.5 bg-red-600/80 rounded-full text-base font-medium">
            <ChevronLeft className="w-5 h-5" /> Назад
          </button>
          <button onClick={createNewChat}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600/80 rounded-full text-base font-medium">
            <MessageSquare className="w-5 h-5" /> Новый диалог
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* WELCOME — КНОПКА "НАЧАТЬ" РАБОТАЕТ! */}
        {step === "welcome" && (
          <motion.div key="welcome" className="flex-1 flex flex-col items-center justify-center gap-12 px-6 text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
              Твой AI 18+
            </h1>
            <button
              onClick={() => setStep("user-gender")}   // ← ИСПРАВЛЕНО!
              className="px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold shadow-2xl hover:scale-105 transition"
            >
              Начать
            </button>
          </motion.div>
        )}

        {/* USER GENDER */}
        {step === "user-gender" && (
          <motion.div key="user" className="flex-1 flex flex-col items-center justify-center gap-16 px-6">
            <h2 className="text-5xl font-bold text-center">Кто ты?</h2>
            <div className="flex gap-10">
              <button onClick={() => { setUserGender("Девушка"); setStep("ai-gender"); }}
                className="px-16 py-10 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-3xl font-bold shadow-2xl hover:scale-105 transition">
                Девушка
              </button>
              <button onClick={() => { setUserGender("Мужчина"); setStep("ai-gender"); }}
                className="px-16 py-10 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold shadow-2xl hover:scale-105 transition">
                Парень
              </button>
            </div>
          </motion.div>
        )}

        {/* AI GENDER */}
        {step === "ai-gender" && (
          <motion.div key="ai" className="flex-1 flex flex-col items-center justify-center gap-16 px-6">
            <h2 className="text-5xl font-bold text-center">Кто будет твоим AI?</h2>
            <div className="flex gap-10">
              <button onClick={() => { setAiGender("Девушка"); setStep("style"); }}
                className="px-16 py-10 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-3xl font-bold shadow-2xl hover:scale-105 transition">
                Девушка
              </button>
              <button onClick={() => { setAiGender("Мужчина"); setStep("style"); }}
                className="px-16 py-10 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold shadow-2xl hover:scale-105 transition">
                Парень
              </button>
            </div>
          </motion.div>
        )}

        {/* STYLE */}
        {step === "style" && (
          <motion.div key="style" className="flex-1 flex flex-col items-center justify-center gap-16 px-6">
            <h2 className="text-5xl font-bold text-center">Стиль общения</h2>
            <div className="grid grid-cols-2 gap-8 max-w-lg w-full">
              {styles.map(s => (
                <button key={s} onClick={() => changeStyle(s)}
                  className="py-8 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 text-2xl font-bold shadow-2xl hover:scale-105 transition">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ЧАТ */}
        {step === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 pt-20 pb-32 space-y-6">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
