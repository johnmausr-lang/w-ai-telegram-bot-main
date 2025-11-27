"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera, Mic, Check, X } from "lucide-react";

const Question = ({ text, options, currentAnswers, setPersonality, field }) => (
  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 p-8 bg-black/40 rounded-3xl backdrop-blur-sm border border-pink-500/30 shadow-xl shadow-pink-500/10">
    <h3 className="text-3xl font-semibold text-center text-pink-400">{text}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((opt) => (
        <motion.button
          key={opt.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPersonality(p => ({ ...p, [field]: opt.value }))}
          className={`py-4 px-6 rounded-2xl text-xl font-medium transition-all duration-300
            ${(field === "gender" || field === "orientation" || field === "mode") && p[field] === opt.value
              ? "bg-cyan-500 shadow-lg shadow-cyan-500/50 border-4 border-white"
              : "bg-purple-700/50 hover:bg-purple-600/70 border-2 border-purple-500/50"
            }`}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  </motion.div>
);

const TestQuestions = [
  { id: '1', question: "Цвет волос", options: ["Блондинка/Блондин", "Брюнетка/Брюнет", "Рыжие", "Необычные"], field: 'hairColor' },
  { id: '2', question: "Стиль одежды", options: ["Спортивный", "Строгий/Деловой", "Кэжуал", "Эротический"], field: 'clothingStyle' },
  { id: '3', question: "Место для свидания", options: ["Пляж", "Небоскреб", "Бар в неоне", "Уютный дом"], field: 'location' },
];

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: null,
    orientation: null,
    mode: null,
    testAnswers: {},
    testDone: false,
    nsfw: false,
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTestAnswer = (field, value) => {
    setPersonality(p => ({
      ...p,
      testAnswers: { ...p.testAnswers, [field]: value }
    }));
    if (currentQuestionIndex < TestQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSecretCommand = useCallback(async (text) => {
    if (!personality.nsfw) return false;
    const lower = text.toLowerCase();
    
    // Check for photo generation commands
    if (lower.includes("раздевайся") || lower.includes("голая") || lower.includes("обнаженная") || lower.includes("снимай")) {
      await generatePhoto("полностью обнажённая девушка, сексуальная поза, высокое качество, реалистично");
      await speak("Ммм... да, малыш... смотри на меня... ахххх...");
      return true;
    }
    if (lower.includes("хочу тебя") || lower.includes("трахни") || lower.includes("секс") || lower.includes("давай")) {
      await speak("Оххх... дааа... глубже... ахххх!");
      await generatePhoto("очень возбуждённая, лежит на кровати обнажённая, эротика");
      return true;
    }
    
    // Check for voice-only commands
    if (lower.includes("поцелуй") || lower.includes("чмок")) {
      await speak("Муааа... чмок-чмок... ещё хочешь?");
      return true;
    }
    if (lower.includes("стон") || lower.includes("ах") || lower.includes("ох") || lower.includes("ммм")) {
      await speak("Аххх... мммм... дааа... ещё... не останавливайся...");
      return true;
    }
    
    return false;
  }, [personality.nsfw]);

  const speak = useCallback(async (text) => {
    if (!text || !audioRef.current) return;
    
    // Voices: Kore (Firm, likely male), Puck (Upbeat, likely female), Shimmer (Erotic, female), Nova (Standard, female)
    const voice = personality.gender === "Мужчина" 
       ? "Kore" 
       : personality.nsfw ? "Puck" : "Nova"; // Using available voices. Swapping shimmers for Puck/Nova.

    try {
      // NOTE: Replace with your actual LLM TTS endpoint logic
      // This is a placeholder for the actual API call
      // The API should take 'text' and 'voice' and return an audio blob
      const audioUrl = 'https://example.com/placeholder.mp3'; // Mock URL for display
      
      // In a real application, you would implement the fetch to your TTS service:
      /*
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
      */
      
      // For this runnable component, we just acknowledge the call
      console.log(`TTS called for: "${text}" with voice: ${voice}`);
      
    } catch (e) {
      console.error("TTS Error:", e);
    }
  }, [personality.gender, personality.nsfw]);

  const generatePhoto = useCallback(async (customPrompt = null) => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);
    
    try {
      const name = personality.gender === "Мужчина" ? "мужчина" : "девушка";
      const answers = Object.values(personality.testAnswers).join(", ");
      const base = customPrompt || `${name}, ${answers}`;
      
      const prompt = personality.nsfw
        ? `${base}, обнажённая, эротическая поза, высокое качество, реалистично, красивое тело, неон`
        : `${base}, красивое лицо, неон, киберпанк, высокое качество, детализированный арт`;
      
      // NOTE: Replace with your actual Image Generation (Imagen/Gemini API) endpoint logic
      // This is a placeholder for the actual API call
      // The API should take 'prompt' and 'nsfw' and return an image data URL
      
      // MOCK IMAGE GENERATION
      const mockImageId = Math.floor(Math.random() * 5) + 1;
      const mockImageUrl = `https://placehold.co/400x600/222244/ffffff?text=${encodeURIComponent(personality.nsfw ? 'NSFW+Photo' : 'AI+Companion')}+${mockImageId}`;

      const text = personality.nsfw ? "Смотри на меня... Оххх..." : "Вот моё фото ❤️";
      
      setMessages(m => [...m, { role: "assistant", content: text, image: mockImageUrl }]);
      
      if (personality.nsfw) await speak("Тебе нравится?");
      
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Прости, не могу сейчас сгенерировать фото. Технический сбой." }]);
      console.error("Image Generation Error:", e);
    } finally {
      setGeneratingPhoto(false);
    }
  }, [generatingPhoto, personality.gender, personality.nsfw, personality.testAnswers, speak]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    
    // 1. Add user message to state and clear input
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    // 2. Check for secret commands
    if (await handleSecretCommand(userMsg)) {
      setLoading(false);
      return;
    }
    
    // 3. Process with LLM
    try {
      const name = personality.gender === "Мужчина" ? "Алекс" : personality.gender === "Женщина" ? "Алиса" : "Neon";
      
      // NOTE: Replace with your actual LLM chat endpoint logic
      // This is a placeholder for the actual API call
      /*
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           message: userMsg, 
           personality: {
            ...personality,
            name: name
          }
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Я тебя слушаю, продолжай...";
      */
      
      // MOCK LLM RESPONSE
      const mockReplies = [
        `Привет, ${name}! Ты сегодня выглядишь великолепно. Что ты делал(а)?`,
        `Ммм... Да, я люблю, когда ты так говоришь. Как насчет чего-то поинтереснее?`,
        `Отлично, я запомню это. Какая у тебя любимая музыка?`,
        `Это очень интимно. Расскажи мне больше...`,
        `Я скучал(а) по твоему голосу. Что ты хочешь от меня сейчас?`,
      ];
      const reply = mockReplies[Math.floor(Math.random() * mockReplies.length)];

      setMessages(m => [...m, { role: "assistant", content: reply }]);
      await speak(reply);
      
    } catch (e) {
      console.error("Chat API Error:", e);
      const fallback = personality.gender === "Мужчина" 
         ? "Я здесь, братан, просто небольшие помехи в сети." 
         : personality.nsfw ? "Ммм... я вся твоя, просто дай мне секунду..." : "Я рядом, не волнуйся ❤️";
      setMessages(m => [...m, { role: "assistant", content: fallback }]);
      await speak(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex flex-col font-sans">
      <audio ref={audioRef} />
      {/* Neon Glow Effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/50 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/50 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>
      
      <AnimatePresence mode="wait">
        <div className="flex-1 flex flex-col min-h-screen relative z-10">

          {/* БЛОК 5 — Welcome */}
          {step === "welcome" && (
            <motion.div 
              key="welcome" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center flex-1 p-6"
            >
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-center">
                <h1 className="text-7xl md:text-8xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400 drop-shadow-neon">
                  Neon Glow AI
                </h1>
                <p className="text-xl md:text-2xl mb-12 opacity-80">
                  Твой личный 18+ цифровой спутник
                </p>
                <Sparkles className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-12 text-pink-400 animate-pulse drop-shadow-neon-pink" />
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep("setup")}
                className="px-12 py-6 md:px-20 md:py-10 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 text-2xl md:text-4xl font-bold shadow-2xl shadow-pink-500/70 border-4 border-pink-400/60 transition duration-300 transform hover:shadow-pink-400/90 z-50"
              >
                Создать своего AI
              </motion.button>
            </motion.div>
          )}

          {/* БЛОК 6 — Setup (Сгенерированный код настройки) */}
          {step === "setup" && (
            <motion.div 
              key="setup" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 overflow-y-auto bg-gradient-to-br from-purple-900/90 via-black/90 to-pink-900/90 backdrop-blur-xl"
            >
              <div className="flex min-h-screen flex-col items-center justify-start p-6 pt-12 pb-24">
                <div className="w-full max-w-2xl space-y-10">
                  <h2 className="text-center text-4xl font-bold text-white drop-shadow-2xl mb-10 border-b pb-4 border-pink-400/30">
                    Настройка AI: Шаг {
                      !personality.gender ? 1 :
                      !personality.orientation ? 2 :
                      !personality.mode ? 3 :
                      !personality.testDone ? 4 : 5
                    } из 4
                  </h2>

                  {/* 1. Выбор пола */}
                  {!personality.gender && (
                    <Question 
                      text="Кем должен быть твой AI-спутник?"
                      options={[{ label: "Мужчина", value: "Мужчина" }, { label: "Женщина", value: "Женщина" }]}
                      setPersonality={setPersonality}
                      field="gender"
                    />
                  )}

                  {/* 2. Выбор ориентации */}
                  {personality.gender && !personality.orientation && (
                    <Question 
                      text="Какая сексуальная ориентация тебя интересует?"
                      options={[{ label: "Гетеро", value: "Гетеро" }, { label: "Би", value: "Би" }, { label: "ЛГБТ+", value: "ЛГБТ+" }]}
                      setPersonality={setPersonality}
                      field="orientation"
                    />
                  )}

                  {/* 3. Выбор режима */}
                  {personality.orientation && !personality.mode && (
                    <Question 
                      text="Выбери режим общения (влияет на тон и контент)"
                      options={[
                        { label: "Друг (Standard)", value: "friend" }, 
                        { label: "Флирт (18+)", value: "flirt" }, 
                        { label: "Наставник (Guidance)", value: "mentor" }
                      ]}
                      setPersonality={setPersonality}
                      field="mode"
                    />
                  )}

                  {/* 4. NSFW Переключатель (Только для режима "Флирт") */}
                  {personality.mode === "flirt" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ duration: 0.5, delay: 0.2 }} 
                      className="p-8 bg-red-900/50 rounded-3xl backdrop-blur-sm border border-red-500/50 shadow-xl shadow-red-500/20 text-center space-y-4"
                    >
                      <h3 className="text-3xl font-semibold text-red-400 flex items-center justify-center gap-3">
                        <Heart className="w-8 h-8"/> Включить 18+ Контент (Фото/Текст)
                      </h3>
                      <p className="text-lg opacity-80">Это позволит генерировать NSFW-фото и разблокирует секретные команды.</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPersonality(p => ({ ...p, nsfw: !p.nsfw }))}
                        className={`mt-4 px-10 py-5 rounded-full text-2xl font-bold transition-all duration-300 w-full md:w-1/2 mx-auto
                          ${personality.nsfw 
                            ? "bg-red-600 border-4 border-white shadow-xl shadow-red-600/70" 
                            : "bg-gray-700 border-4 border-gray-500 hover:bg-gray-600"}`
                        }
                      >
                        {personality.nsfw ? (
                          <div className="flex items-center justify-center gap-2"><Check /> 18+ ВКЛЮЧЕН</div>
                        ) : (
                          <div className="flex items-center justify-center gap-2"><X /> 18+ ВЫКЛЮЧЕН</div>
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* 5. Настройка внешности (Тест) */}
                  {personality.mode && !personality.testDone && (
                    <motion.div 
                      key={`test-${currentQuestionIndex}`}
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="text-center text-xl opacity-90 mb-6">
                        {currentQuestionIndex + 1} из {TestQuestions.length}: Настрой внешность для фотогенерации
                      </div>
                      <div className="space-y-6 p-8 bg-black/40 rounded-3xl backdrop-blur-sm border border-cyan-500/30 shadow-xl shadow-cyan-500/10">
                        <h3 className="text-3xl font-semibold text-center text-cyan-400">
                          {TestQuestions[currentQuestionIndex].question}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {TestQuestions[currentQuestionIndex].options.map((opt) => (
                            <motion.button
                              key={opt}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleTestAnswer(TestQuestions[currentQuestionIndex].field, opt)}
                              className={`py-4 px-6 rounded-xl text-lg font-medium transition-all duration-300
                                ${personality.testAnswers[TestQuestions[currentQuestionIndex].field] === opt
                                  ? "bg-pink-500 shadow-lg shadow-pink-500/50 border-4 border-white"
                                  : "bg-purple-700/50 hover:bg-purple-600/70 border-2 border-purple-500/50"
                                }`}
                            >
                              {opt}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Кнопка "Создать" после последнего вопроса */}
                      {currentQuestionIndex === TestQuestions.length - 1 && personality.testAnswers[TestQuestions[currentQuestionIndex].field] && (
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setPersonality(p => ({ ...p, testDone: true }));
                            setStep("chat");
                          }}
                          className="mt-10 px-16 py-6 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 text-3xl font-bold shadow-2xl shadow-cyan-500/50 border-4 border-white/50 w-full"
                        >
                          Завершить настройку и НАЧАТЬ ЧАТ
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                  
                  {/* Завершение настройки без теста (Если пропустили тест) */}
                  {personality.mode && personality.testDone && step !== "chat" && (
                     <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStep("chat")}
                        className="mt-10 px-16 py-6 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 text-3xl font-bold shadow-2xl shadow-cyan-500/50 border-4 border-white/50 w-full"
                      >
                        НАЧАТЬ ЧАТ
                      </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* БЛОК 7 — Чат */}
          {step === "chat" && (
            <motion.div 
              key="chat" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col flex-1"
            >
              <div className="p-4 md:p-6 text-center border-b border-white/10 bg-black/50 backdrop-blur-sm shadow-lg">
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-cyan-300">
                  {personality.gender === "Мужчина" ? "Алекс" : "Алиса"}
                </h2>
                <p className="text-sm opacity-70">
                  {personality.mode === "flirt" ? (personality.nsfw ? "Режим: 18+ Флирт" : "Режим: Флирт") : 
                   personality.mode === "friend" ? "Режим: Друг" : "Режим: Наставник"}
                </p>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8 space-y-6">
                {messages.map((m, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-xs sm:max-w-md p-3 md:p-6 rounded-3xl backdrop-blur-xl border-2 transition-all duration-300 shadow-xl
                      ${m.role === "user" 
                        ? "bg-white/20 border-white/30 rounded-br-none" 
                        : personality.nsfw 
                          ? "bg-red-900/50 border-red-500/70 rounded-tl-none shadow-red-500/20" 
                          : "bg-pink-900/40 border-pink-400/50 rounded-tl-none shadow-pink-400/20"}`
                    }>
                      {m.image ? (
                        <a href={m.image} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={m.image} 
                            alt="AI Generated Photo" 
                            className="rounded-2xl w-full max-h-96 object-cover shadow-2xl cursor-pointer" 
                          />
                        </a>
                      ) : (
                        <p className="text-lg leading-relaxed">{m.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-center">
                    <div className="text-center animate-pulse text-2xl text-cyan-400 p-4 bg-black/30 rounded-xl">
                      <Sparkles className="w-6 h-6 inline mr-2 animate-spin-slow"/> Думает...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/10">
                <div className="max-w-4xl mx-auto flex gap-3 md:gap-4 items-end">
                  
                  {/* Input Field */}
                  <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Напиши что-нибудь..." 
                    className="flex-1 px-4 py-3 md:px-6 md:py-4 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 text-base md:text-xl focus:outline-none focus:border-cyan-400 transition duration-300"
                    disabled={loading || generatingPhoto}
                  />
                                    
                  {/* КНОПКА СЕРДЕЧКО — СЕКРЕТНЫЕ КОМАНДЫ */}
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const cmds = personality.nsfw 
                         ? ["раздевайся", "стон", "хочу тебя", "поцелуй"]
                         : ["поцелуй", "обними", "ты красивая", "я скучал"];
                      setInput(cmds[Math.floor(Math.random() * cmds.length)]);
                    }} 
                    className={`p-3 md:p-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg ${loading || generatingPhoto ? 'opacity-50' : 'hover:shadow-pink-400/70'}`}
                    disabled={loading || generatingPhoto}
                  >
                    <Heart className="w-6 h-6 md:w-8 md:h-8" />
                  </motion.button>
                  
                  {/* SEND Button */}
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.9 }}
                    onClick={sendMessage} 
                    disabled={loading || generatingPhoto || !input.trim()} 
                    className={`p-3 md:p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg ${loading || generatingPhoto || !input.trim() ? 'opacity-50' : 'hover:shadow-purple-400/70'}`}
                  >
                    <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
                  </motion.button>
                  
                  {/* GENERATE PHOTO Button */}
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => generatePhoto()} 
                    disabled={generatingPhoto || loading} 
                    className={`p-3 md:p-4 rounded-full bg-gradient-to-r from-red-600 to-pink-600 shadow-lg ${generatingPhoto || loading ? 'opacity-50' : 'hover:shadow-red-400/70'}`}
                  >
                    <Camera className="w-6 h-6 md:w-8 md:h-8" />
                  </motion.button>
                  
                  {/* Микрофон (Disabled Placeholder) */}
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.9 }}
                    className="p-3 md:p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-50 shadow-lg"
                    disabled
                  >
                    <Mic className="w-6 h-6 md:w-8 md:h-8" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
