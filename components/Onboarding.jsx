"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Onboarding({ visible, setPersonality, onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    gender: "Женщина",
    mode: "flirt",
    nsfw: true,
    theme: "neonPink",
  });

  const steps = [
    "Выбор внешности",
    "Выбор характера",
    "Тематика общения",
  ];

  if (!visible) return null;

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setPersonality(data);
      onComplete();
    }
  };

  const select = (field, value) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AnimatePresence>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.35 }}
          className="blur-glass"
          style={{
            width: "90%",
            maxWidth: 420,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h2 className="text-2xl font-bold mb-4">{steps[step]}</h2>

          {step === 0 && (
            <div className="space-y-4">
              <button
                onClick={() => select("gender", "Женщина")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Женский образ
              </button>
              <button
                onClick={() => select("gender", "Мужчина")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Мужской образ
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <button
                onClick={() => select("mode", "gentle")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Нежная
              </button>
              <button
                onClick={() => select("mode", "flirt")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Флиртующая
              </button>
              <button
                onClick={() => select("mode", "playful")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Игривая
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <button
                onClick={() => select("theme", "neonPink")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Neon Pink
              </button>
              <button
                onClick={() => select("theme", "cyberBlue")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Cyber Blue
              </button>
              <button
                onClick={() => select("theme", "violetDream")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Violet Dream
              </button>
            </div>
          )}

          <button
            onClick={next}
            className="mt-6 w-full py-3 px-4 bg-pink-500 rounded-xl font-bold text-white"
          >
            Далее
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
