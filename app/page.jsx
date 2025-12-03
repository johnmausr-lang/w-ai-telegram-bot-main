// app/page.jsx — ФИНАЛЬНАЯ ВЕРСИЯ (декабрь 2025)

"use client";

import { AnimatePresence } from "framer-motion";
import WelcomeScreen from "../components/WelcomeScreen";
import UserGenderStep from "../components/setup/UserGenderStep";
import GenderStep from "../components/setup/GenderStep";
import StyleStep from "../components/setup/StyleStep";
import ChatLayout from "../components/chat/ChatLayout";
import useChat from "../hooks/useChat";

export default function NeonGlowAI() {
  const {
    step,
    setStep,
    personality,
    setPersonality,
    messages,
    input,
    setInput,
    loading,
    generatingPhoto,
    sendMessage,
    generatePhoto,
    undoLastMessage,
    resetChat,
  } = useChat();

  // Кнопка «Назад» — чётко по одному шагу назад
  const goBack = () => {
    if (step === "user-gender") setStep("welcome");
    else if (step === "gender") setStep("user-gender");
    else if (step === "style") setStep("gender");
  };

  return (
    <div className="min-h-screen w-screen neon-bg flex flex-col">
      {/* Кнопка Назад — только на шагах настройки */}
      {step !== "welcome" && step !== "chat" && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full text-sm hover:bg-white/20 transition-all"
          >
            ← Назад
          </button>
        </div>
      )}

      {/* Основной контент — всегда по центру */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {/* 1. Приветствие */}
          {step === "welcome" && (
            <WelcomeScreen onStart={() => setStep("user-gender")} />
          )}

          {/* 2. Кто ты? */}
          {step === "user-gender" && (
            <UserGenderStep
              personality={personality}
              setPersonality={setPersonality}
              setStep={setStep}
            />
          )}

          {/* 3. Кто тебя заводит? */}
          {step === "gender" && (
            <GenderStep
              personality={personality}
              setPersonality={setPersonality}
              setStep={setStep}
            />
          )}

          {/* 4. Стиль общения → ПЕРЕХОД В ЧАТ ГАРАНТИРОВАН */}
          {step === "style" && (
            <StyleStep
              personality={personality}
              setPersonality={setPersonality}
              setStep={setStep}
              onComplete={() => {
                // ← ДВОЙНАЯ ГАРАНТИЯ ПЕРЕХОДА
                console.log("→ Переход в чат...");
                setStep("chat");
              }}
            />
          )}

          {/* 5. Чат — с премиум хедером */}
          {step === "chat" && (
            <ChatLayout
              messages={messages}
              input={input}
              setInput={setInput}
              loading={loading}
              generatingPhoto={generatingPhoto}
              sendMessage={sendMessage}
              generatePhoto={generatePhoto}
              undoLastMessage={undoLastMessage}
              resetChat={resetChat}
              personality={personality}   // ← Обязательно для имени и аватарки
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
