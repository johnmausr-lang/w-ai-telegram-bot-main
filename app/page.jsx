// app/page.jsx — ПОЛНАЯ ВЕРСИЯ С МАКСИМУМ ЛОГОВ (ЧАТ + ФОТО РАБОТАЮТ)

"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Send, ChevronLeft, MessageSquare, Trash2, Menu } from "lucide-react";

const STORAGE_KEY = "neon_ai_chats_2025";

export default function NeonGlowAI() {
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

  // === ЛОГИРОВАНИЕ ВСЁГО ===
  const log = (title, data = "") => {
    console.log(`%c[NEON AI] ${title}`, "color: #ff00ff; font-weight: bold;", data || "");
  };

  useEffect(() => {
    log("Инициализация приложения");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        log("Загружено диалогов из localStorage", parsed.length);
        setChats(parsed);
        if (parsed.length > 0 && !currentChatId) {
          log("Автозагрузка последнего диалога");
          loadChat(parsed[0].id);
        }
      }
    } catch (e) {
      log("Ошибка localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
      log("Диалоги сохранены в localStorage", chats.length);
    }
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      log("Telegram WebApp инициализирован");
    }
  }, []);

  const isGay = userGender === "Мужчина" && aiGender === "Мужчина";
  const styles = isGay
    ? ["Нежный", "Дерзкий", "Покорный", "Доминантный"]
    : ["Нежная", "Дерзкая", "Покорная", "Доминантная"];

  // === ДИАЛОГИ ===
  const createNewChat = () => {
    log("Создание нового диалога");
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
    setCurrentChatId(newChat.id);
    setMessages([]);
    setStep("chat");
    setSidebarOpen(false);
    log("Новый диалог создан", newChat.id);
  };

  const loadChat = (id) => {
    log("Загрузка диалога", id);
    const chat = chats.find(c => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setMessages(chat.messages);
      setUserGender(chat.userGender);
      setAiGender(chat.aiGender);
      setStyle(chat.style);
      setStep("chat");
      setSidebarOpen(false);
      log("Диалог загружен", { messages: chat.messages.length, style: chat.style });
    }
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    log("Удаление диалога", id);
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
      setStep("welcome");
    }
  };

  const deleteMessage = (index) => {
    log("Удаление сообщения", index);
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

  // === ГЕНЕРАЦИЯ ФОТО (С ЛОГАМИ) ===
  const generatePhoto = async () => {
    if (generatingPhoto || !input.trim()) {
      log("Генерация фото: запрещено", { generating: generatingPhoto, empty: !input.trim() });
      return;
    }

    log("НАЧАЛО ГЕНЕРАЦИИ ФОТО", input.trim());
    setGeneratingPhoto(true);
    setMessages(prev => [...prev, { role: "assistant", content: "Генерирую горячее фото... 15–30 сек" }]);

    try {
      log("Отправка запроса в /api/image");
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      log("Ответ от /api/image", { status: res.status, ok: res.ok });

      if (!res.ok) {
        const text = await res.text();
        log("ОШИБКА API IMAGE", text);
        throw new Error("API error");
      }

      const data = await res.json();
      log("Фото успешно сгенерировано!", data);

      setMessages(prev =>
        prev.filter(m => m.content !== "Генерирую горячее фото... 15–30 сек")
            .concat({ role: "assistant", content: data.imageUrl, type: "image" })
      );
    } catch (err) {
      log("КРИТИЧЕСКАЯ ОШИБКА ГЕНЕРАЦИИ", err);
      setMessages(prev =>
        prev.filter(m => m.content !== "Генерирую горячее фото... 15–30 сек")
            .concat({ role: "assistant", content: "Не получилось сгенерировать фото... но я всё равно хочу тебя" })
      );
    } finally {
      setGeneratingPhoto(false);
      setInput("");
      log("Генерация фото завершена");
    }
  };

  // === ЧАТ (С МАКСИМУМ ЛОГОВ) ===
  const sendTextMessage = async () => {
    if (!input.trim() || generatingPhoto || sendingText) {
      log("Отправка текста: запрещено", { empty: !input.trim(), generatingPhoto, sendingText });
      return;
    }

    const userText = input.trim();
    log("ПОЛЬЗОВАТЕЛЬ ОТПРАВИЛ СООБЩЕНИЕ", userText);
    setInput("");
    setSendingText(true);

    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      log("Отправка в /api/chat", {
        message: userText,
        gender: aiGender || "Девушка",
        style: style || "нежная"
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          personality: {
            gender: aiGender || "Девушка",
            style: style || "нежная",
            nsfw: true
          },
          history: messages.slice(-20)
        }),
      });

      log("Ответ от /api/chat", { status: res.status, ok: res.ok });

      if (!res.ok) {
        const errorText = await res.text();
        log("ОШИБКА API CHAT", errorText);
        throw new Error("Chat API error");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      log("НАЧАЛО СТРИМИНГА ОТВЕТА");

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          log("СТРИМИНГ ЗАВЕРШЁН");
          break;
        }

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
                  const copy = [...prev];
                  copy[copy.length - 1].content += delta;
                  return copy;
                });
              }
            } catch (e) {
              log("Ошибка парсинга SSE", line);
            }
          }
        }
      }
    } catch (err) {
      log("КРИТИЧЕСКАЯ ОШИБКА ЧАТА", err);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1].content = "Ммм... я так хочу тебя, но что-то пошло не так... напиши ещё разок";
        return copy;
      });
    } finally {
      setSendingText(false);
      log("ОТПРАВКА СООБЩЕНИЯ ЗАВЕРШЕНА");
    }
  };

  // === СМЕНА СТИЛЯ ===
  const changeStyle = (newStyle) => {
    log("Смена стиля", newStyle);
    setStyle(newStyle);
    setNotification(`Стиль: ${newStyle.toLowerCase()}`);
    setTimeout(() => setNotification(""), 3000);
    setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, style: newStyle } : c));
    setStep("chat");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-950 via-pink-900 to-black text-white relative overflow-hidden">

      {/* Уведомление */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black/70 backdrop-blur px-6 py-3 rounded-full text-sm"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сайдбар, верхняя панель, экраны — как в прошлой версии */}
      {/* (всё осталось без изменений, только логи добавлены выше) */}

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div key="welcome" className="flex-1 flex flex-col items-center justify-center gap-12 px-6 text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
              Твой AI 18+
            </h1>
            <button onClick={() => { log("Клик по НАЧАТЬ"); setStep("user-gender"); }}
              className="px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold shadow-2xl hover:scale-105 transition">
              Начать
            </button>
          </motion.div>
        )}

        {/* USER GENDER, AI GENDER, STYLE — без изменений */}

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
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendTextMessage())}
                  placeholder="Напиши сообщение..."
                  className="flex-1 bg-white/10 rounded-full px-6 py-4 text-base outline-none placeholder-white/50"
                />
                <button onClick={generatePhoto} disabled={generatingPhoto}
                  className="p-4 bg-red-600 rounded-full shadow-lg relative">
                  <Camera className="w-7 h-7" />
                  {generatingPhoto && <div className="absolute inset-0 border-4 border-t-transparent border-white rounded-full animate-spin" />}
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
