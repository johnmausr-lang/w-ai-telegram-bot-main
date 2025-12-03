// components/setup/UserGenderStep.jsx — ТОЛЬКО ПАРЕНЬ / ДЕВУШКА
import { motion } from "framer-motion";

export default function UserGenderStep({ personality, setPersonality, setStep }) {
  return (
    <motion.div
      key="user-gender"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center flex flex-col items-center justify-center gap-12 px-6 w-full max-w-md"
    >
      <h2 className="text-4xl sm:text-5xl font-bold">Кто ты?</h2>
      <div className="grid grid-cols-2 gap-8 w-full">
        {["Парень", "Девушка"].map(option => (
          <motion.button
            key={option}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setPersonality(p => ({ ...p, userGender: option }));
              setStep("gender");
            }}
            className="px-10 py-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold shadow-2xl"
          >
            {option}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
