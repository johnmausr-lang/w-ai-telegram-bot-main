// components/chat/ChatLayout.jsx — ПОЛНОСТЬЮ ЗАМЕНИТЬ
import { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInputBar from "./ChatInputBar";
import ChatControls from "./ChatControls";
import ChatHeader from "./ChatHeader";

export default function ChatLayout({
  messages,
  input,
  setInput,
  loading,
  generatingPhoto,
  sendMessage,
  generatePhoto,
  undoLastMessage,
  resetChat,
  personality,
}) {
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Показываем "печатает..." пока идёт стриминг
  useEffect(() => {
    if (loading) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* ПРЕМИУМ ХЕДЕР */}
      <ChatHeader personality={personality} isTyping={isTyping} />

      {/* Сообщения — отступ сверху под хедер */}
      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-36 space-y-5">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Управление чатом */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-center py-2">
          <ChatControls undoLastMessage={undoLastMessage} resetChat={resetChat} />
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10">
        <ChatInputBar
          input={input}
          setInput={setInput}
          loading={loading}
          generatingPhoto={generatingPhoto}
          sendMessage={sendMessage}
          generatePhoto={generatePhoto}
        />
      </div>
    </div>
  );
}
