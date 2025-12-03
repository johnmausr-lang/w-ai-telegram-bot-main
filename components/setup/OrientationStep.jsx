// components/setup/OrientationStep.jsx
import { motion } from "framer-motion";

export default function OrientationStep({ personality, setPersonality, setStep }) {
  const options = personality.gender === "Парень"
    ? ["натурал", "би", "гей"]
    : ["натурал", "би", "лесби"];

  return (
    <motion.div
      key="orientation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center flex flex-col items-center justify-center gap-12 px-6"
    >
      <h2 className="text-4xl sm:text-5xl font-bold">Ориентация</h2>
      <div className="grid grid-cols-1 gap-6 w-full max-w-lg">
        {options.map(o => (
          <motion.button
            key={o}
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              setPersonality(p => ({ ...p, orientation: o }));
              setStep("style");
            }}
            className="px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold capitalize"
          >
            {o}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
