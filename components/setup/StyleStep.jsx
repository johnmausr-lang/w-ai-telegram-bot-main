// components/setup/StyleStep.jsx — ФИНАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ

import { motion } from "framer-motion";

export default function StyleStep({ personality, setPersonality, setStep, onComplete }) {
  const styles = ["нежная", "дерзкая", "покорная", "доминантная"];

  const handleStyleSelect = (style) => {
    // Сохраняем выбранный стиль
    setPersonality((prev) => ({
      ...prev,
      style: style,
    }));

    // ← ГЛАВНОЕ: вызываем onComplete → в page.jsx сработает setStep("chat")
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <motion.div
      key="style"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center flex flex-col items-center justify-center gap-12 px-6 w-full max-w-md"
    >
      <h2 className="text-4xl sm:text-5xl font-bold text-white">
        Выбери стиль общения
      </h2>

      <div className="grid grid-cols-2 gap-8 w-full">
        {styles.map((s) => (
          <motion.button
            key={s}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStyleSelect(s)}
            className="px-10 py-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all capitalize"
          >
            {s === "нежная" && "Нежная"}
            {s === "дерзкая" && "Дерзкая"}
            {s === "покорная" && "Покорная"}
            {s === "доминантная" && "Доминантная"}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
