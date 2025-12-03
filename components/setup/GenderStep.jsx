// components/setup/GenderStep.jsx — ИСПРАВЛЕННАЯ ВЕРСИЯ (декабрь 2025)

import { motion } from "framer-motion";

export default function GenderStep({ personality, setPersonality, setStep }) {
  return (
    <motion.div
      key="gender"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center flex flex-col items-center justify-center gap-12 px-6 w-full max-w-md"
    >
      <h2 className="text-4xl sm:text-5xl font-bold">Кто тебя заводит?</h2>
      <div className="grid grid-cols-2 gap-8 w-full">
        {["Девушка", "Парень"].map((g) => (
          <motion.button
            key={g}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setPersonality((p) => ({ ...p, gender: g }));
              // ПЕРЕХОДИМ СРАЗУ НА СТИЛЬ — БЕЗ ШАГА "orientation"!
              setStep("style");
            }}
            className="px-10 py-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold shadow-2xl"
          >
            {g}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
