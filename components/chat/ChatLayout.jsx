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
      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-5">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        <div ref={messagesEndRef} />
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
        <ChatControls undoLastMessage={undoLastMessage} resetChat={resetChat} />
      </div>
    </div>
  );
}
