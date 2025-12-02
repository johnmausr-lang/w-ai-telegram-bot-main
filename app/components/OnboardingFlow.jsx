"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState("whoAreYou");
  const [userGender, setUserGender] = useState("");
  const [partnerGender, setPartnerGender] = useState("");
  const [style, setStyle] = useState("");

  const next = () => {
    if (step === "whoAreYou") setStep("whoPartner");
    else if (step === "whoPartner") setStep("style");
    else if (step === "style") onComplete({ userGender, partnerGender, style });
  };

  const options = step === "style"
    ? ["нежная", "дерзкая", "покорная", "доминантная"]
    : ["Девушка", "Парень"];

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center h-screen px-8"
    >
      <h1 className="text-5xl font-bold mb-16 bg-gradient-to-r from-[#FF47A3] to-[#00CCFF] bg-clip-text text-transparent">
        {step === "whoAreYou" && "Кто ты?"}
        {step === "whoPartner" && "Кто твой спутник?"}
        {step === "style" && "Стиль общения"}
      </h1>

      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        {options.map((opt) => (
          <motion.button
            key={opt}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              if (step === "whoAreYou") setUserGender(opt);
              if (step === "whoPartner") setPartnerGender(opt);
              if (step === "style") { setStyle(opt); next(); return; }
              next();
            }}
            className="py-20 glass rounded-3xl text-3xl font-medium border border-white/10 hover:border-[#FF47A3] transition-all"
          >
            {opt === "нежная" ? "Нежная" : opt === "дерзкая" ? "Дерзкая" : opt === "покорная" ? "Покорная" : opt === "доминантная" ? "Доминантная" : opt}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
