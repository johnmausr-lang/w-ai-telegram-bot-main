// app/page.jsx
"use client";

import { AnimatePresence } from "framer-motion";
import WelcomeScreen from "@/components/WelcomeScreen";
import GenderStep from "@/components/setup/GenderStep";
import OrientationStep from "@/components/setup/OrientationStep";
import StyleStep from "@/components/setup/StyleStep";
import ChatLayout from "@/components/chat/ChatLayout";
import useChat from "@/hooks/useChat";

export default function NeonGlowAI() {
  const {
    step,
    personality,
    setPersonality,
    setStep,
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

  return (
    <div className="min-h-screen w-screen neon-bg flex items-center justify-center">
      <AnimatePresence mode="wait">
        {step === "welcome" && <WelcomeScreen onStart={() => setStep("gender")} />}
        {step === "gender" && <GenderStep personality={personality} setPersonality={setPersonality} setStep={setStep} />}
        {step === "orientation" && <OrientationStep personality={personality} setPersonality={setPersonality} setStep={setStep} />}
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
