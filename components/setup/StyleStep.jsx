// components/setup/StyleStep.jsx
import { motion } from "framer-motion";

export default function StyleStep({ personality, setPersonality, setStep, onComplete }) {
  const styles = ["нежная", "дерзкая", "покорная", "доминантная"];

  return (
    <motion.div
      key="style"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center flex flex-col items-center justify-center gap-12 px-6"
    >
      <h2 className="text-4xl sm:text-5xl font-bold text-center">Стиль общения</h2>
      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        {styles.map(s => (
          <motion.button
            key={s}
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              setPersonality(p => ({ ...p, style: s }));
              onComplete();
            }}
            className="px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold capitalize"
          >
            {s === "нежная" ? "Нежная" : s === "дерзкая" ? "Дерзкая" : s === "покорная" ? "Покорная" : "Доминантная"}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
