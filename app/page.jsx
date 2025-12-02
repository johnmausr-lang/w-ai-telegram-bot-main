// app/page.jsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

import OnboardingFlow from "./components/OnboardingFlow";
import ChatScreen from "./components/ChatScreen";
import HistorySidebar from "./components/HistorySidebar";
import GalleryGrid from "./components/GalleryGrid";
import BreathingBackground from "./components/BreathingBackground";

const MAX_CHATS = 10;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState("onboarding");
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sleek_chats_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChats(parsed);
        if (parsed.length > 0) {
          setCurrentChat(parsed[0]);
          setStep("chat");
        }
      } catch (e) {
        localStorage.removeItem("sleek_chats_v2");
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

  // Пока не замонтировался клиент — показываем красивый лоадер
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1C1C23] to-[#0A0A0E] flex items-center justify-center">
        <div className="w-24 h-24 bg-gradient-to-r from-[#FF47A3] to-[#00CCFF] rounded-full animate-pulse blur-xl" />
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
            onOpenSidebar={() => setShowSidebar(true)}
            onOpenGallery={() => setShowGallery(true)}
          />
        )}
      </AnimatePresence>

      <HistorySidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onSelectChat={handleSelectChat}
      />

      <GalleryGrid isOpen={showGallery} onClose={() => setShowGallery(false)} />
    </>
  );
}
