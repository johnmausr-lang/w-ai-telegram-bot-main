// app/page.jsx — ЗАМЕНИ ЭТОТ ФАЙЛ ПОЛНОСТЬЮ
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

  // Универсальная кнопка «Назад»
  const goBack = () => {
    const order = ["user-gender", "gender", "style", "chat"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
    else setStep("welcome");
  };

  return (
    <div className="min-h-screen w-screen neon-bg flex flex-col">
      {/* Кнопка Назад — появляется со второго шага */}
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

      <AnimatePresence mode="wait">
        {step === "welcome" && <WelcomeScreen onStart={() => setStep("user-gender")} />}
        {step === "user-gender" && <UserGenderStep personality={personality} setPersonality={setPersonality} setStep={setStep} />}
        {step === "gender" && <GenderStep personality={personality} setPersonality={setPersonality} setStep={setStep} />}
        {step === "style" && <StyleStep personality={personality} setPersonality={setPersonality} setStep={setStep} onComplete={() => setStep("chat")} />}
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
