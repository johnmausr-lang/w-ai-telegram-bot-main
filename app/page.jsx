// app/page.jsx — ФИНАЛЬНАЯ ВЕРСИЯ С ЭКРАНОМ ЗАГРУЗКИ

"use client";

import { AnimatePresence } from "framer-motion";
import WelcomeScreen from "../components/WelcomeScreen";
import UserGenderStep from "../components/setup/UserGenderStep";
import GenderStep from "../components/setup/GenderStep";
import StyleStep from "../components/setup/StyleStep";
import LoadingScreen from "../components/LoadingScreen";
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

  const goBack = () => {
    if (step === "user-gender") setStep("welcome");
    else if (step === "gender") setStep("user-gender");
    else if (step === "style") setStep("gender");
  };

  return (
    <div className="min-h-screen w-screen neon-bg flex flex-col">
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
          {step === "welcome" && <WelcomeScreen key="welcome" onStart={() => setStep("user-gender")} />}
          {step === "user-gender" && <UserGenderStep key="user-gender" personality={personality} setPersonality={setPersonality} setStep={setStep} />}
          {step === "gender" && <GenderStep key="gender" personality={personality} setPersonality={setPersonality} setStep={setStep} />}
          {step === "style" && <StyleStep key="style" personality={personality} setPersonality={setPersonality} setStep={setStep} />}
          {step === "loading" && <LoadingScreen key="loading" />}
          {step === "chat" && (
            <ChatLayout
              key="chat"
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
