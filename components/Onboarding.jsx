"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding({ visible, onComplete, setPersonality }) {
  const steps = [
    {
      title: "Кто я буду для тебя?",
      options: ["Девушка", "Парень", "Нейтральный ИИ"],
      key: "gender",
    },
    {
      title: "Наш стиль общения?",
      options: ["Флирт", "Теплый", "Провокационный"],
      key: "mode",
    },
    {
      title: "Можно чуть-чуть NSFW?",
      options: ["Да", "Нет"],
      key: "nsfw",
    },
  ];

  const [step, setStep] = useState(0);

  function choose(option) {
    const key = steps[step].key;
    let value = option;

    if (key === "nsfw") value = option === "Да";
    if (key === "mode") {
      if (option === "Флирт") value = "flirt";
      if (option === "Теплый") value = "friendly";
      if (option === "Провокационный") value = "spicy";
    }

    setPersonality((p) => ({ ...p, [key]: value }));

    if (step === steps.length - 1) onComplete();
    else setStep(step + 1);
  }

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 border border-white/20 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6">{steps[step].title}</h2>

        <div className="flex flex-col gap-3">
          {steps[step].options.map((o, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="px-4 py-3 rounded-2xl bg-pink-600/60 backdrop-blur-lg border border-white/20"
              onClick={() => choose(o)}
            >
              {o}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
