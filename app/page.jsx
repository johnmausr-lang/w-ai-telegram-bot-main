"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import OnboardingFlow from "@/components/OnboardingFlow";
import ChatScreen from "@/components/ChatScreen";
import HistorySidebar from "@/components/HistorySidebar";
import GalleryGrid from "@/components/GalleryGrid";
import BreathingBackground from "@/components/BreathingBackground";
import { loadChats, saveChats } from "@/lib/storage";
import { haptic } from "@/lib/haptic";

const MAX_CHATS = 10;

export default function SleekNocturne() {
  const [step, setStep] = useState("onboarding");
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const saved = loadChats();
    if (saved.length > 0) {
      setChats(saved);
      setCurrentChat(saved[0]);
      setStep("chat");
    }
  }, []);

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

  return (
    <>
      <BreathingBackground />

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

      <HistorySidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onSelectChat={(chat) => {
          setCurrentChat(chat);
          setStep("chat");
        }}
      />

      <GalleryGrid isOpen={showGallery} onClose={() => setShowGallery(false)} />
    </>
  );
}
