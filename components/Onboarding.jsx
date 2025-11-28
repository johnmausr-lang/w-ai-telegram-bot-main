"use client";

import { motion, AnimatePresence } from "framer-motion";
import { themes } from "@/app/themes";

export default function Onboarding({ visible, onComplete, setPersonality }) {
  if (!visible) return null;

  const select = (field, value) => {
    setPersonality((p) => ({ ...p, [field]: value }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/70"
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="p-8 rounded-3xl bg-white/10 border border-white/20 shadow-2xl max-w-md w-[90%] text-center"
          >
            <h1 className="text-3xl mb-4 font-bold">Добро пожаловать</h1>
            <p className="text-white/70 mb-6">
              Давай настроим твоего AI-компаньона 🌙
            </p>

            {/* GENDER */}
            <div className="mb-6">
              <p className="text-white/70 mb-2">Пол персонажа</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => select("gender", "Женщина")}
                  className="px-4 py-2 bg-white/20 rounded-xl"
                >
                  Женщина
                </button>
                <button
                  onClick={() => select("gender", "Мужчина")}
                  className="px-4 py-2 bg-white/20 rounded-xl"
                >
                  Мужчина
                </button>
              </div>
            </div>

            {/* MODE */}
            <div className="mb-6">
              <p className="text-white/70 mb-2">Стиль общения</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => select("mode", "gentle")}
                  className="px-4 py-2 bg-white/20 rounded-xl"
                >
                  Нежный
                </button>
                <button
                  onClick={() => select("mode", "friendly")}
                  className="px-4 py-2 bg-white/20 rounded-xl"
                >
                  Дружелюбный
                </button>
                <button
                  onClick={() => select("mode", "playful")}
                  className="px-4 py-2 bg-white/20 rounded-xl"
                >
                  Игривый
                </button>
              </div>
            </div>

            {/* THEME */}
            <div className="mb-6">
              <p className="text-white/70 mb-2">Тема интерфейса</p>
              <div className="flex gap-3 justify-center flex-wrap">
                {Object.keys(themes).map((key) => (
                  <button
                    key={key}
                    onClick={() => select("theme", key)}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/20"
                  >
                    {themes[key].name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onComplete}
              className="w-full py-3 bg-pink-500 rounded-xl text-lg font-bold mt-4"
            >
              Начать
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
