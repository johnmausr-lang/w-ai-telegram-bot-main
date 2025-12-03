// app/page.jsx — С МАКСИМАЛЬНЫМ ЛОГИРОВАНИЕМ (декабрь 2025)

"use client";

import { useEffect } from "react";
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
    showHeart,
  } = useChat();

  // ГЛОБАЛЬНОЕ ЛОГИРОВАНИЕ — ВСЁ, ЧТО ПРОИСХОДИТ
  useEffect(() => {
    console.log("NeonGlowAI: РЕНДЕР");
    console.log("Текущий step:", step);
    console.log("Personality:", personality);
    console.log("Messages count:", messages.length);
    console.log("Telegram WebApp:", !!window.Telegram?.WebApp);
  }, [step, personality, messages]);

  const handleStyleComplete = () => {
    console.log("StyleStep: onComplete вызван → переходим в чат");
    setStep("chat");
  };

  const goBack = () => {
    console.log("Кнопка Назад нажата, текущий step:", step);
    if (step === "user-gender") setStep("welcome");
    else if (step === "gender") setStep("user-gender");
    else if (step === "style") setStep("gender");
  };

  console.log("Рендерим шаг:", step);

  return (
    <div className="min-h-screen w-screen neon-bg flex flex-col">
      {/* Лог кнопки Назад */}
      {(step === "user-gender" || step === "gender" || step === "style") && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all"
          >
            ← Назад
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <div key="welcome">
              {console.log("РЕНДЕРИМ: WelcomeScreen")}
              <WelcomeScreen onStart={() => {
                console.log("WelcomeScreen: Нажата кнопка Начать → user-gender");
                setStep("user-gender");
              }} />
            </div>
          )}

          {step === "user-gender" && (
            <div key="user-gender">
              {console.log("РЕНДЕРИМ: UserGenderStep")}
              <UserGenderStep
                personality={personality}
                setPersonality={setPersonality}
                setStep={setStep}
              />
            </div>
          )}

          {step === "gender" && (
            <div key="gender">
              {console.log("РЕНДЕРИМ: GenderStep")}
              <GenderStep
                personality={personality}
                setPersonality={setPersonality}
                setStep={setStep}
              />
            </div>
          )}

          {step === "style" && (
            <div key="style">
              {console.log("РЕНДЕРИМ: StyleStep")}
              <StyleStep
                personality={personality}
                setPersonality={setPersonality}
                setStep={setStep}
                onComplete={handleStyleComplete}
              />
            </div>
          )}

          {step === "chat" && (
            <div key="chat">
              {console.log("РЕНДЕРИМ: ChatLayout — ЧАТ ДОЛЖЕН БЫТЬ ВИДЕН!")}
              {console.log("Передаём в ChatLayout:", { messages: messages.length, personality, showHeart })}
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
                personality={personality}
                showHeart={showHeart}
              />
            </div>
          )}

          {/* ЕСЛИ НИ ОДИН ШАГ НЕ СОВПАЛ — ПОКАЗЫВАЕМ ОШИБКУ */}
          {![
            "welcome",
            "user-gender",
            "gender",
            "style",
            "chat"
          ].includes(step) && (
            <div className="text-red-500 text-4xl">
              ОШИБКА: неизвестный step = "{step}"
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
