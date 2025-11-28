// components/OnboardingPro.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { themes } from "@/app/themes";

export default function OnboardingPro({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "",
    avatarPrompt: "киберпанк девушка с неоновыми глазами, 3D, реалистично",
    theme: "neonPink",
  });

  const generateAvatar = async () => {
    const res = await fetch("/api/avatar", {
      method: "POST",
      body: JSON.stringify({ prompt: data.avatarPrompt }),
    });
    const { image } = await res.json();
    setData(prev => ({ ...prev, avatar: image }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-black"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-full max-w-lg p-10 rounded-3xl bg-black/60 backdrop-blur-3xl border border-white/20"
      >
        {step === 0 && (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">Создай своего спутника</h1>
            <input
              placeholder="Как тебя зовут?"
              className="w-full px-6 py-5 rounded-2xl bg-white/10 border border-white/20 text-xl"
              onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
            />
            <button
              onClick={() => setStep(1)}
              className="mt-8 w-full py-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-xl font-bold"
            >
              Далее
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold mb-6">Опиши внешность</h2>
            <textarea
              placeholder="Например: девушка с синими волосами, кибер-импланты, неоновая кожа..."
              className="w-full h-40 px-6 py-5 rounded-2xl bg-white/10 border border-white/20"
              onChange={e => setData(prev => ({ ...prev, avatarPrompt: e.target.value }))}
            />
            <button onClick={generateAvatar} className="mt-4 w-full py-4 bg-cyan-500 rounded-2xl">
              Сгенерировать аватар
            </button>
            {data.avatar && (
              <img src={data.avatar} className="w-full rounded-2xl mt-4" />
            )}
            <button
              onClick={() => setStep(2)}
              className="mt-8 w-full py-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-xl font-bold"
            >
              Далее
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-3xl font-bold mb-6">Выбери стиль</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(themes).map(key => (
                <button
                  key={key}
                  onClick={() => setData(prev => ({ ...prev, theme: key }))}
                  className={`p-6 rounded-2xl border-2 transition ${
                    data.theme === key ? "border-pink-500" : "border-white/20"
                  }`}
                  style={{ background: themes[key].glow }}
                >
                  {themes[key].name}
                </button>
              ))}
            </div>
            <button
              onClick={() => onComplete(data)}
              className="mt-10 w-full py-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl text-2xl font-bold"
            >
              Войти в мир
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
