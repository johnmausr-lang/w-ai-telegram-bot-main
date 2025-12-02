```jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import ChatHeader from "./ChatHeader";
import ImageFullScreen from "./ImageFullScreen";
import { isImagePrompt } from "@/lib/utils";
import { haptic } from "@/lib/haptic";

export default function ChatScreen({ chat, onNewChat, onOpenSidebar, onOpenGallery }) {
  const [messages, setMessages] = useState(chat.messages || []);
  const [input, setInput] = useState("");
  const [fullImage, setFullImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nsfwLevel, setNsfwLevel] = useState(chat.personality?.nsfwLevel || 70);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Имитация ответа ИИ
    setTimeout(() => {
      const aiResponse = {
        role: "assistant",
        content: "Ох, как ты меня заводишь… Продолжай, я вся твоя",
      };
      setMessages((prev) => [...prev, aiResponse]);
      haptic("light");
    }, 800 + Math.random() * 1200);
  };

  const generateImage = () => {
    setIsGenerating(true);
    haptic("medium");

    setTimeout(() => {
      const fakeImages = [
        "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80",
        "https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=800&q=80",
        "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&q=80",
        "https://images.unsplash.com/photo-1562572159-1acd5c6e8e36?w=800&q=80",
      ];

      const newImage = {
        role: "assistant",
        type: "image",
        content: fakeImages[Math.floor(Math.random() * fakeImages.length)],
      };

      setMessages((prev) => [...prev, newImage]);
      setIsGenerating(false);
      haptic("success");
    }, 3200);
  };

  const showImagePrompt = isImagePrompt(input);

  return (
    <>
      <div className="flex flex-col h-screen bg-[#0A0A0E] relative overflow-hidden">
        {/* Дышащий фон */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#FF47A3]/8 via-transparent to-[#00CCFF]/8 pointer-events-none" />

        {/* Шапка */}
        <ChatHeader
          partnerGender={chat.personality.partnerGender}
          style={chat.personality.style}
          nsfwLevel={nsfwLevel}
          setNsfwLevel={setNsfwLevel}
          onOpenSidebar={onOpenSidebar}
          onOpenGallery={onOpenGallery}
          onNewChat={onNewChat}
        />

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto pt-32 pb-40 px-6">
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                message={msg}
                onImageClick={(src) => setFullImage({ src, isGenerating: false })}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Поле ввода */}
        <InputBar
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          onImageGen={generateImage}
          isImagePrompt={showImagePrompt}
        />
      </div>

      {/* Полноэкранное изображение */}
      <AnimatePresence>
        {fullImage && (
          <ImageFullScreen
            src={fullImage.src}
            isGenerating={isGenerating && fullImage.isGenerating}
            onClose={() => setFullImage(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
