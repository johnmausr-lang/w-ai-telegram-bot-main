// components/chat/ChatControls.jsx
import { ChevronLeft, RotateCcw } from "lucide-react";

export default function ChatControls({ undoLastMessage, resetChat }) {
  return (
    <>
      <button
        onClick={undoLastMessage}
        className="flex items-center gap-2 px-5 py-2 bg-red-600/80 hover:bg-red-600 rounded-full text-sm transition-all"
      >
        <ChevronLeft className="w-5 h-5" /> Назад
      </button>
      <button
        onClick={resetChat}
        className="flex items-center gap-2 px-5 py-2 bg-purple-600/80 hover:bg-purple-600 rounded-full text-sm transition-all"
      >
        <RotateCcw className="w-5 h-5" /> Новая
      </button>
    </>
  );
}
