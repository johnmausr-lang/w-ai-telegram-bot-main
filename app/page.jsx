"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Send, ChevronLeft, MessageSquare, Trash2, Menu } from "lucide-react";
import { format } from "date-fns";

const STORAGE_KEY = "neon_ai_chats_v1";

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [userGender, setUserGender] = useState(null);
  const [aiGender, setAiGender] = useState(null);
  const [style, setStyle] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [notification, setNotification] = useState("");
  const [chats, setChats] = useState([]); // список диалогов
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const messagesEndRef = useRef(null);

  // Загрузка диалогов из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setChats(parsed);
        if (parsed.length > 0 && !currentChatId) {
          loadChat(parsed[0].id);
        }
      }
    } catch (e) {}
  }, []);

  // Сохранение при изменении
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

  // Создать новый диалог
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "Новый диалог",
      messages: [],
      createdAt: new Date(),
      userGender: userGender || "Не выбрано",
      aiGender: aiGender || "Не выбрано",
      style: style || "Не выбран"
    };
    setChats(prev => [newChat, ...prev]);
    loadChat(newChat.id);
    setShowSidebar(false);
  };

  // Загрузить диалог
  const loadChat = (id) => {
    const chat = chats.find(c => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setMessages(chat.messages);
      setUserGender(chat.userGender);
      setAiGender(chat.aiGender);
      setStyle(chat.style);
      setStep("chat");
    }
  };

  // Удалить диалог
  const deleteChat = (id, e) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
      setStep("welcome");
    }
  };

  // Удалить сообщение (долгое нажатие)
  const deleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
    setChats(prev => prev.map(chat =>
      chat.id === currentChatId
        ? { ...chat, messages: messages.filter((_, i) => i !== index) }
        : chat
    ));
  };

  // Обновить текущий чат
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const title = messages[0]?.content?.slice(0, 30) || "Новый диалог";
      setChats(prev => prev.map(chat =>
        chat.id === currentChatId ? { ...chat, messages, title } : chat
      ));
    }
  }, [messages, currentChatId]);

  const generatePhoto = async () => {
    if (generating || !input.trim()) return;
    setGenerating(true);
    setMessages(prev => [...prev, { role: "assistant", content: "Генерирую фото... 15–25 сек" }]);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });
      const { imageUrl } = await res.json();

      setMessages(prev =>
        prev.filter(m => m.content !== "Генерирую фото... 15–25 сек")
            .concat({ role: "assistant", content: imageUrl, type: "image" })
      );
    } catch {
      setMessages(prev => prev.concat({ role: "assistant", content: "Ошибка генерации" }));
    } finally {
      setGenerating(false);
      setInput("");
    }
  };

  const sendMessage = () => {
    if (!input.trim() || generating) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setMessages(prev => [...prev, { role: "assistant", content: "Скоро будет Grok-4" }]);
    setInput("");
  };

  const changeStyle = (newStyle) => {
    setStyle(newStyle);
    setNotification(`Стиль: ${newStyle.toLowerCase()}`);
    setTimeout(() => setNotification(""), 3000);
    setChats(prev => prev.map(chat =>
      chat.id === currentChatId ? { ...chat, style: newStyle } : chat
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-950 via-pink-900 to-black text-white relative">

      {/* Уведомление */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full text-sm"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Боковая панель */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="fixed inset-y-0 left-0 w-80 bg-black/90 backdrop-blur-xl z-50 border-r border-white/10 flex flex-col"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Диалоги</h2>
                <button onClick={() => setShowSidebar(false)} className="p-2"><ChevronLeft /></button>
              </div>
            </div>
            <button
              onClick={createNewChat}
              className="m-4 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg"
            >
              + Новый диалог
            </button>
            <div className="flex-1 overflow-y-auto">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`p-4 border-b border-white/10 flex justify-between items-center hover:bg-white/5 transition ${currentChatId === chat.id ? "bg-white/10" : ""}`}
                >
                  <div className="flex-1">
                    <div className="font-semibold">{chat.title}</div>
                    <div className="text-sm opacity-70">
                      {chat.style} • {format(new Date(chat.createdAt), "dd.MM HH:mm")}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="p-2 hover:bg-red-600/50 rounded-lg transition"
                  >
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
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed top-4 left-4 z-40 p-3 bg-black/70 rounded-full backdrop-blur-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* Остальные шаги (welcome, выбор пола и т.д.) — без изменений */}
        {step === "welcome" && (
          <motion.div key="w" className="flex-1 flex flex-col items-center justify-center gap-12 px-6 text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
              Твой AI 18+
            </h1>
            <button onClick={createNewChat} className="px-12 py-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold">
              Начать
            </button>
          </motion.div>
        )}

        {step === "user-gender" && (
          <motion.div key="u" className="flex-1 flex flex-col items-center justify-center gap-16 px-6">
            <h2 className="text-5xl font-bold text-center">Кто ты?</h2>
            <div className="flex gap-10">
              <button onClick={() => { setUserGender("Девушка"); setStep("ai-gender"); }}
                className="px-16 py-10 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-3xl font-bold shadow-2xl">
                Девушка
              </button>
              <button onClick={() => { setUserGender("Мужчина"); setStep("ai-gender"); }}
                className="px-16 py-10 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold shadow-2xl">
                Парень
              </button>
            </div>
          </motion.div>
        )}

        {step === "ai-gender" && (
          <motion.div key="a" className="flex-1 flex flex-col items-center justify-center gap-16 px-6">
            <h2 className="text-5xl font-bold text-center">Кто будет твоим AI?</h2>
            <div className="flex gap-10">
              <button onClick={() => { setAiGender("Девушка"); setStep("style"); }}
                className="px-16 py-10 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-3xl font-bold shadow-2xl">
                Девушка
              </button>
              <button onClick={() => { setAiGender("Мужчина"); setStep("style"); }}
                className="px-16 py-10 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold shadow-2xl">
                Парень
              </button>
            </div>
          </motion.div>
        )}

        {step === "style" && (
          <motion.div key="s" className="flex-1 flex flex-col items-center justify-center gap-16 px-6">
            <h2 className="text-5xl font-bold text-center">Стиль общения</h2>
            <div className="grid grid-cols-2 gap-8 max-w-lg w-full">
              {styles.map(s => (
                <button
                  key={s}
                  onClick={() => { changeStyle(s); setStep("chat"); }}
                  className="py-8 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 text-2xl font-bold shadow-2xl"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 pt-20 pb-32 space-y-6">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onLongPress={() => deleteMessage(i)}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-2xl ${m.role === "user" ? "bg-purple-700" : "bg-pink-700"}`}
                    onClick={() => m.type === "image" && window.open(m.content, "_blank")}
                  >
                    {m.type === "image" ? (
                      <img
                        src={m.content}
                        alt="18+"
                        className="rounded-2xl w-full max-w-sm mx-auto cursor-pointer border-4 border-purple-500/50"
                      />
                    ) : (
                      <p className="text-lg leading-relaxed">{m.content}</p>
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
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), input.includes("фото") ? generatePhoto() : sendMessage())}
                  placeholder="Напиши или 'сделай фото'"
                  className="flex-1 bg-white/10 rounded-full px-6 py-4 text-base outline-none placeholder-white/50"
                />
                <button onClick={generatePhoto} disabled={generating} className="p-4 bg-red-600 rounded-full shadow-lg relative">
                  <Camera className="w-7 h-7" />
                  {generating && <div className="absolute inset-0 border-4 border-t-transparent border-white rounded-full animate-spin"></div>}
                </button>
                <button onClick={sendMessage} className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg">
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
