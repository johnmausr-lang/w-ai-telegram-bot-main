// components/setup/GenderStep.jsx
import { motion } from "framer-motion";

export default function GenderStep({ personality, setPersonality, setStep }) {
  return (
    <motion.div
      key="gender"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center flex flex-col items-center justify-center gap-12 px-6"
    >
      <h2 className="text-4xl sm:text-5xl font-bold">Кто тебя заводит?</h2>
      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        {["Девушка", "Парень"].map(g => (
          <motion.button
            key={g}
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              setPersonality(p => ({ ...p, gender: g }));
              setStep("orientation");
            }}
            className="px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold"
          >
            {g}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
