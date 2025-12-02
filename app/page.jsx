// app/page.jsx — ФИНАЛЬНАЯ ВЕРСИЯ ДЛЯ VERCEL (модульная + рабочая)
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

// Относительные импорты — работают на Vercel в App Router 100%
import OnboardingFlow from "./components/OnboardingFlow";
import ChatScreen from "./components/ChatScreen";
import HistorySidebar from "./components/HistorySidebar";
import GalleryGrid from "./components/GalleryGrid";
import BreathingBackground from "./components/BreathingBackground";
import { loadChats, saveChats } from "./lib/storage";
import { haptic } from "./lib/haptic";

const MAX_CHATS = 10;

export default function SleekNocturne() {
  const [step, setStep] = useState("onboarding");
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // Загружаем чаты при старте
  useEffect(() => {
    const saved = loadChats();
    if (saved.length > 0) {
      setChats(saved);
      setCurrentChat(saved[0]);
      setStep("chat");
    }
  }, []);

  // Создание нового чата
  const startNewChat = (personality) => {
    const id = Date.now().toString();
    const newChat = {
      id,
      title: `${personality.partnerGender} • ${personality.style}`,
      messages: [],
      personality,
      createdAt: new Date().toISOString(),
    };
    const updated = [newChat, ...chats].slice(0, MAX_CHATS);
    setChats(updated);
    saveChats(updated);
    setCurrentChat(newChat);
    setStep("chat");
    haptic("medium");
  };

  // Выбор чата из истории
  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
    setStep("chat");
    setShowSidebar(false);
  };

  return (
    <>
      {/* Дышащий фон */}
      <BreathingBackground />

      {/* Основной контент */}
      <AnimatePresence mode="wait">
        {step === "onboarding" && (
          <OnboardingFlow onComplete={startNewChat} />
        )}

        {step === "chat" && currentChat && (
          <ChatScreen
            chat={currentChat}
            onNewChat={() => setStep("onboarding")}
            onOpenSidebar={() => setShowSidebar(true)}
            onOpenGallery={() => setShowGallery(true)}
          />
        )}
      </AnimatePresence>

      {/* Боковая панель с историей */}
      <HistorySidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onSelectChat={handleSelectChat}
      />

      {/* Галерея изображений */}
      <GalleryGrid
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
      />
    </>
  );
}
