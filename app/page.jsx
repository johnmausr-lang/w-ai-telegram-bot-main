// app/page.jsx — ФИНАЛЬНАЯ ВЕРСИЯ, КОТОРАЯ РАБОТАЕТ НА VERCEL СЕЙЧАС ЖЕ
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import OnboardingFlow from "./components/OnboardingFlow";
import ChatScreen from "./components/ChatScreen";
import HistorySidebar from "./components/HistorySidebar";
import GalleryGrid from "./components/GalleryGrid";
import BreathingBackground from "./components/BreathingBackground";

const MAX_CHATS = 10;

export default function SleekNocturne() {
  const [step, setStep] = useState("onboarding");
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // Только на клиенте!
  useEffect(() => {
    if (typeof window === "undefined") return;
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
    const title = `${personality.partnerGender} • ${personality.style}${isMale ? "" : "ая"}`;

    const newChat = {
      id,
      title,
      messages: [],
      personality,
      createdAt: new Date().toISOString(),
    };

    const updated = [newChat, ...chats].slice(0, MAX_CHATS);
    setChats(updated);
    localStorage.setItem("sleek_chats_v2", JSON.stringify(updated));
    setCurrentChat(newChat);
    setStep("chat");
  };

  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
    setStep("chat");
    setShowSidebar(false);
  };

  return (
    <>
      <BreathingBackground />

      <AnimatePresence mode="wait">
        {step === "onboarding" && <OnboardingFlow onComplete={startNewChat} />}

        {step === "chat" && currentChat && (
          <ChatScreen
            chat={currentChat}
            onNewChat={() => setStep("onboarding")}
            onOpenSidebar={() => setShowSidebar(true)}
            onOpenGallery={() => setShowGallery(true)}
          />
        )}
      </AnimatePresence>

      <HistorySidebar
        isOpen={showSidebar}
        chats={chats}
        onClose={() => setShowSidebar(false)}
        onSelectChat={handleSelectChat}
      />

      <GalleryGrid isOpen={showGallery} onClose={() => setShowGallery(false)} />
    </>
  );
}
