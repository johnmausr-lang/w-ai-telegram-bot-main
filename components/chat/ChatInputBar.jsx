// components/chat/ChatInputBar.jsx
import { Heart, MessageCircle, Camera } from "lucide-react";

export default function ChatInputBar({
  input,
  setInput,
  loading,
  generatingPhoto,
  sendMessage,
  generatePhoto,
}) {
  return (
    <div className="p-4 flex items-end gap-3">
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
        placeholder="Напиши или нажми камеру..."
        rows={1}
        className="flex-1 bg-white/10 rounded-2xl px-5 py-3.5 text-base outline-none resize-none max-h-32 placeholder-white/50 scrollbar-hide"
      />
      <button
        onClick={() => setInput(prev => prev + " ❤️")}
        className="p-3.5 bg-pink-600 rounded-full shadow-lg"
      >
        <Heart className="w-6 h-6" />
      </button>
      <button
        onClick={sendMessage}
        disabled={loading}
        className="p-3.5 bg-purple-600 rounded-full shadow-lg"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      <button
        onClick={generatePhoto}
        disabled={generatingPhoto}
        className="p-3.5 bg-red-600 rounded-full shadow-lg relative"
      >
        <Camera className="w-6 h-6" />
        {generatingPhoto && (
          <div className="absolute inset-0 border-4 border-t-transparent border-white rounded-full animate-spin" />
        )}
      </button>
    </div>
  );
}
