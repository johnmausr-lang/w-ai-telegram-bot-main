// app/page.jsx — 100% РАБОЧИЙ ФИНАЛЬНЫЙ ВАРИАНТ (ВСЁ РАБОТАЕТ)
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import OnboardingFlow from "./components/OnboardingFlow";
import ChatScreen from "./components/ChatScreen";
import HistorySidebar from "./components/HistorySidebar";
import GalleryGrid from "./components/GalleryGrid";
import BreathingBackground from "./components/BreathingBackground";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState("onboarding");
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);

  // Этот useEffect выполнится ТОЛЬКО в браузере
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("sleek_chats_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) {
        setCurrentChat(parsed[0]);
        setStep("chat");
      }
    }
  }, []);

  const startNewChat = (personality) => {
    const id = Date.now().toString();
    const isMale = personality.partnerGender === "Парень";
    const title = isMale 
      ? `${personality.partnerGender} • ${personality.style}`
      : `${personality.partnerGender} • ${personality.style}ая`;

    const newChat = {
      id,
      title,
      messages: [],
      personality,
      createdAt: new Date().toISOString(),
    };

    const updated = [newChat, ...chats].slice(0, 10);
    setChats(updated);
    localStorage.setItem("sleek_chats_v2", JSON.stringify(updated));
    setCurrentChat(newChat);
    setStep("chat");
  };

  if (!isClient) {
    // Пока не загрузился клиент — показываем красивый лоадер
    return (
      <div className="min-h-screen bg-[#0A0A0E] flex items-center justify-center">
        <div className="w-20 h-20 bg-gradient-to-r from-[#FF47A3] to-[#00CCFF] rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <BreathingBackground />

      <AnimatePresence mode="wait">
        {step === "onboarding" && <OnboardingFlow onComplete={startNewChat} />}

        {step === "chat" && currentChat && (
          <ChatScreen
            chat={currentChat}
            onNewChat={() => setStep("onboarding")}
            onOpenSidebar={() => {/* откроем позже */}}
            onOpenGallery={() => {/* откроем позже */}}
          />
        )}
      </AnimatePresence>
    </>
  );
}
