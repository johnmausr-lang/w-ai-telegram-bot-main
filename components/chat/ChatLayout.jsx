// components/chat/ChatLayout.jsx
import { useRef } from "react";
import MessageBubble from "./MessageBubble";
import ChatInputBar from "./ChatInputBar";
import ChatControls from "./ChatControls";

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
}) {
  const messagesEndRef = useRef(null);

  return (
    <div className="flex flex-col h-screen">
      {/* ВЕРХНЯЯ ПАНЕЛЬ — Назад + Новая беседа */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex justify-center gap-6 py-3">
          <ChatControls undoLastMessage={undoLastMessage} resetChat={resetChat} />
        </div>
      </div>

      {/* Сообщения — отступ сверху под панель */}
      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-36 space-y-5">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ — теперь чистая и красивая */}
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
