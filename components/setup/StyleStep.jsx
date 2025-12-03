// components/setup/StyleStep.jsx — ИСПРАВЛЕНО: ТЕКСТ В КНОПКАХ НЕ ВЫЛЕЗАЕТ
import { motion } from "framer-motion";

export default function StyleStep({ personality, setPersonality, setStep, onComplete }) {
  const styles = [
    { value: "нежная", label: "Нежная" },
    { value: "дерзкая", label: "Дерзкая" },
    { value: "покорная", label: "Покорная" },
    { value: "доминантная", label: "Доминантная" },
  ];

  const handleSelect = (style) => {
    setPersonality(p => ({ ...p, style }));
    onComplete();
  };

  return (
    <motion.div
      key="style"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="text-center flex flex-col items-center justify-center gap-12 px-6 w-full max-w-md"
    >
      <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
        Выбери стиль<br />общения
      </h2>

      <div className="grid grid-cols-2 gap-6 w-full">
        {styles.map(({ value, label }) => (
          <motion.button
            key={value}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(value)}
            className="px-8 py-6 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 text-xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all"
          >
            {label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
