"use client";
import { motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { loadChats } from "../lib/storage";

export default function HistorySidebar({ isOpen, onClose, onSelectChat }) {
  const chats = loadChats();

  const handleDelete = (e, id) => {
    e.stopPropagation();
    const newChats = chats.filter(c => c.id !== id);
    localStorage.setItem("sleek_chats_v2", JSON.stringify(newChats));
    if (chats.length === 1) onClose();
  };

  return (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: isOpen ? 0 : "-100%" }}
      className="fixed inset-y-0 left-0 w-80 glass z-50 flex flex-col"
    >
      <div className="p-5 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-semibold">История</h2>
        <button onClick={onClose}><X className="w-6 h-6" /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="text-center text-[#8A8A99] py-10">Пока нет чатов</p>
        ) : (
          chats.map((chat) => (
            <motion.div
              key={chat.id}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              onClick={() => onSelectChat(chat)}
              className="p-4 border-b border-white/5 cursor-pointer flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{chat.title}</p>
                <p className="text-xs text-[#8A8A99]">
                  {new Date(chat.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <button onClick={(e) => handleDelete(e, chat.id)}>
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-5">
        <button
          onClick={() => { onClose(); window.location.reload(); }}
          className="w-full py-4 bg-gradient-to-r from-[#FF47A3] to-[#CC338F] rounded-2xl font-medium glow-pink"
        >
          Новый спутник
        </button>
      </div>
    </motion.div>
  );
}
