// components/chat/ChatLayout.jsx — ФИНАЛЬНАЯ ВЕРСИЯ (ДЕКАБРЬ 2025)

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
  showHeart,
}) {
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // АВТОПРОКРУТКА ПРИ НОВЫХ СООБЩЕНИЯХ
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Индикатор "печатает..."
  useEffect(() => {
    if (loading) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [loading]);

  return (
    <div className="flex flex-col h-screen relative">
      {/* ХЕДЕР С ИМЕНЕМ И ШКАЛОЙ */}
      <ChatHeader personality={personality} isTyping={isTyping} />

      {/* СООБЩЕНИЯ */}
      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-36 space-y-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* КНОПКИ "Назад" и "Новая" */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-center py-2">
          <ChatControls undoLastMessage={undoLastMessage} resetChat={resetChat} />
        </div>
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10">
        <ChatInputBar
          input={input}
          setInput={setInput}
          loading={loading}
          generatingPhoto={generatingPhoto}
          sendMessage={sendMessage}
          generatePhoto={generatePhoto}
          showHeart={showHeart}
        />
      </div>
    </div>
  );
}
