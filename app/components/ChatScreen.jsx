"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import ChatHeader from "./ChatHeader";
import ImageFullScreen from "./ImageFullScreen";
import { isImagePrompt } from "../lib/utils";
import { haptic } from "../lib/haptic";

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
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "Ммм… я вся твоя Продолжай, милый" }]);
      haptic("light");
    }, 800 + Math.random() * 1000);
  };

  const generateImage = () => {
    setIsGenerating(true);
    haptic("medium");

    setTimeout(() => {
      const fakeImgs = [
        "https://picsum.photos/800/1200?random=1",
        "https://picsum.photos/800/1200?random=2",
        "https://picsum.photos/800/1200?random=3",
      ];
      const img = fakeImgs[Math.floor(Math.random() * fakeImgs.length)];
      setMessages(prev => [...prev, { role: "assistant", type: "image", content: img }]);
      setIsGenerating(false);
    }, 3200);
  };

  const showImageBtn = isImagePrompt(input);

  return (
    <>
      <div className="flex flex-col h-screen bg-[#0A0A0E] relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-[#FF47A3]/8 to-[#00CCFF]/8 pointer-events-none" />

        <ChatHeader
          partnerGender={chat.personality.partnerGender}
          style={chat.personality.style}
          nsfwLevel={nsfwLevel}
          setNsfwLevel={setNsfwLevel}
          onOpenSidebar={onOpenSidebar}
          onOpenGallery={onOpenGallery}
        />

        <div className="flex-1 overflow-y-auto pt-32 pb-40 px-6">
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} onImageClick={setFullImage} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <InputBar
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          onImageGen={generateImage}
          isImagePrompt={showImageBtn}
        />
      </div>

      <AnimatePresence>
        {fullImage && (
          <ImageFullScreen
            src={fullImage}
            isGenerating={isGenerating}
            onClose={() => setFullImage(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
