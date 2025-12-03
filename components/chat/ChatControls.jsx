// components/chat/ChatControls.jsx
import { ChevronLeft } from "lucide-react";

export default function ChatControls({ undoLastMessage, resetChat }) {
  return (
    <div className="flex justify-center gap-6 pb-4">
      <button
        onClick={undoLastMessage}
        className="flex items-center gap-2 px-5 py-2 bg-red-600/80 rounded-full text-sm"
      >
        <ChevronLeft className="w-5 h-5" /> Назад
      </button>
      <button
        onClick={resetChat}
        className="px-6 py-2 bg-purple-600/80 rounded-full text-sm"
      >
        Новая беседа
      </button>
    </div>
  );
}
