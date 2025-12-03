// components/setup/UserGenderStep.jsx
import { motion } from "framer-motion";

export default function UserGenderStep({ personality, setPersonality, setStep }) {
  return (
    <motion.div
      key="user-gender"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center flex flex-col items-center justify-center gap-12 px-6"
    >
      <h2 className="text-4xl sm:text-5xl font-bold">Кто ты?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg">
        {["Парень", "Девушка", "Другое"].map(option => (
          <motion.button
            key={option}
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              setPersonality(p => ({ ...p, userGender: option }));
              setStep("gender"); // → следующий шаг: кто тебя заводит
            }}
            className="px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold"
          >
            {option}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
