// Файл: page.jsx (Полный и исправленный код)
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera, Mic, Volume2, StopCircle } from "lucide-react"; 

export default function NeonGlowAI() {
  // БЛОК 1 — Импорты и состояние
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: null, 
    orientation: null, 
    mode: null, 
    nsfw: false,
    testAnswers: {},
    testDone: false,
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [isRecording, setIsRecording] = useState(false);
  
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null); 
  
  // Переменные для записи голоса
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // =========================================================================
  // БЛОК 2 — Эффекты
  // =========================================================================

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
      window.Telegram.WebApp.setHeaderColor('#000000');
      window.Telegram.WebApp.setBackgroundColor('#000000');
    }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isRecording, loading]);
  
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsSpeaking(false);
    if (audio) { audio.addEventListener('ended', handleEnded); }
    return () => { if (audio) { audio.removeEventListener('ended', handleEnded); } };
  }, []);


  // =========================================================================
  // БЛОК 3 — ФУНКЦИИ (В правильном порядке зависимостей)
  // =========================================================================

  // 1. Speak - Функция синтеза речи (TTS)
  const speak = useCallback(async (text) => {
    if (!text || isSpeaking) return;
    // Используем 'nova' для женщины, 'echo' для мужчины.
    const gender = personality.gender === "Женщина" ? "nova" : "echo"; 
      
    setIsSpeaking(true);
    
    try {
      const res = await fetch("/api/tts", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: gender }),
      });
      
      if (!res.ok) {
        throw new Error("TTS API failed");
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(e => {
          console.error("Audio play failed:", e);
          setIsSpeaking(false);
        });
      }
    } catch (e) {
      console.error("TTS error:", e);
      setIsSpeaking(false);
    }
  }, [isSpeaking, personality.gender]);


  // 2. GeneratePhoto - Генерация фото (Dall-E 3)
  const generatePhoto = useCallback(async (customPrompt = null) => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);
    
    const basePromptParts = Object.values(personality.testAnswers).filter(Boolean);
    const base = basePromptParts.length > 0 
        ? basePromptParts.join(", ") 
        : (personality.gender === "Мужчина" ? "красивый парень" : "красивая девушка");
        
    const finalPrompt = customPrompt || base;
    
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, nsfw: personality.nsfw }),
      });
      
      if (!res.ok) throw new Error("Image generation failed");

      const imageBlob = await res.blob();
      const url = URL.createObjectURL(imageBlob);
      
      const text = personality.nsfw 
        ? "Смотри на меня... 🔥" 
        : personality.gender === "Мужчина" ? "Вот моё фото 📸" : "Вот моё фото ❤️";

      setMessages(m => [...m, { role: "assistant", content: text, image: url }]);
      speak(personality.nsfw ? "Тебе нравится? 😏" : "Как тебе?");
      
    } catch (e) {
      console.error("Image generation error:", e);
      setMessages(m => [...m, { role: "assistant", content: "Не могу сейчас сгенерировать фото. Попробуй позже." }]);
    } finally {
      setGeneratingPhoto(false);
    }
  }, [generatingPhoto, personality.testAnswers, personality.gender, personality.nsfw, speak]);

  
  // 3. HandleSecretCommand - Обработка секретных команд
  const handleSecretCommand = useCallback(async (text) => {
    if (!personality.nsfw) return false;
    const lower = text.toLowerCase();
    
    // Внутри объекта secrets мы вызываем generatePhoto() и speak()
    const secrets = {
      "раздевайся|голая|обнаженная|снимай": () => {
        generatePhoto("полностью обнажённая девушка, сексуальная поза, высокое качество, реалистично");
        speak("Ммм... да, малыш... смотри на меня... ахххх...");
      },
      "поцелуй|чмок": () => speak("Муааа... чмок-чмок... ещё хочешь?"),
      "хочу тебя|трахни|секс|давай": () => {
        speak("Оххх... дааа... глубже... ахххх!");
        generatePhoto("очень возбуждённая, лежит на кровати обнажённая, эротика");
      },
      "стон|ах|ох|ммм": () => speak("Аххх... мммм... дааа... ещё... не останавливайся..."),
      "на колени|отсоси|в рот": () => {
        speak("Даа... бери в ротик... глубже...");
        generatePhoto("на коленях, рот открыт, эротика");
      },
      "кончи|сперма|кончил": () => {
        speak("Дааа... заливай меня... я вся твоя...");
        generatePhoto("сперма на лице, очень возбуждённая, эротика");
      },
      "фото|покажи себя": () => {
          generatePhoto();
          speak("Тебе нравится? 😏");
      }
    };
    for (const [keys, action] of Object.entries(secrets)) {
      if (keys.split("|").some(k => lower.includes(k))) {
        action();
        return true;
      }
    }
    return false;
  }, [personality.nsfw, generatePhoto, speak]);

  
  // 4. SendMessage - Отправка сообщения в чат (Core function)
  const sendMessage = useCallback(async (customInput = null) => {
    const userMsg = (customInput || input).trim();
    if (!userMsg || loading) return;
    
    if (!customInput) setInput(""); 

    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    // 1. Обрабатываем секретную команду
    if (await handleSecretCommand(userMsg)) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, personality }),
      });
      if (!res.ok) throw new Error("Chat API failed");

      const data = await res.json();
      const reply = data.reply || (personality.nsfw ? "Аххх... даа..." : "Я рядом ❤️"); 
      
      setMessages(m => [...m, { role: "assistant", content: reply }]);
      // 2. Озвучиваем ответ
      speak(reply);
      
    } catch (e) {
      console.error("Chat message error:", e);
      const fallback = personality.gender === "Мужчина"
        ? "Я здесь, братан"
        : personality.nsfw ? "Ммм... я вся твоя..." : "Я рядом ❤️";
      setMessages(m => [...m, { role: "assistant", content: fallback }]);
      speak(fallback);
    } finally {
      setLoading(false);
    }
  }, [input, loading, personality, handleSecretCommand, speak]);


  // 5. SendAudioToSTT - Отправка аудио на распознавание речи (STT)
  const sendAudioToSTT = useCallback(async (audioBlob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_message.webm');
      
      const res = await fetch('/api/stt', {
        method: 'POST',
        body: formData, 
      });

      if (!res.ok) throw new Error('STT failed');

      const data = await res.json();
      const transcribedText = data.text;

      if (transcribedText) {
        await sendMessage(transcribedText); // Вызываем sendMessage с распознанным текстом
      } else {
        setMessages(m => [...m, { role: "assistant", content: "Не удалось распознать речь." }]);
      }
      
    } catch (error) {
      console.error('STT API error:', error);
      setMessages(m => [...m, { role: "assistant", content: "Ошибка распознавания речи." }]);
    } finally {
      setLoading(false);
    }
  }, [sendMessage]);


  // 6. StartRecording / StopRecording - Запись голоса
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Используем audio/webm, так как это стандартный формат, поддерживаемый браузерами и STT API
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); 
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToSTT(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setMessages(m => [...m, { role: "assistant", content: "Началась запись голоса..." }]);
    } catch (err) {
      console.error('Error starting recording:', err);
      setMessages(m => [...m, { role: "assistant", content: "Не удалось получить доступ к микрофону." }]);
      setIsRecording(false);
    }
  }, [sendAudioToSTT]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };


  // =========================================================================
  // БЛОК 4 — UI (Остаётся без изменений)
  // =========================================================================

  // Функции для шагов UI
  const handleSelect = (key, value) => {
    setPersonality(p => ({ ...p, [key]: value }));
    if (key === 'gender') setStep("orientation");
    if (key === 'orientation') setStep("mode");
    if (key === 'mode') setStep("nsfw");
  };

  const handleNsfw = (value) => {
    setPersonality(p => ({ ...p, nsfw: value }));
    setStep("test");
  };

  const handleTestAnswer = (index, answer) => {
    setPersonality(p => ({
      ...p,
      testAnswers: { ...p.testAnswers, [index]: answer }
    }));
    if (index === 3) {
        setPersonality(p => ({ ...p, testDone: true }));
        setStep("chat");
        setMessages(m => [...m, { role: "assistant", content: personality.nsfw 
            ? `Оххх... я готова! Пиши мне всё, что захочешь, или нажми на ❤️ для секретов 😉`
            : `Привет! Я готова общаться. Спроси меня о чем-нибудь!`}]);
        speak(personality.nsfw 
            ? `Оххх... я готова! Пиши мне всё, что захочешь, или нажми на сердечко для секретов`
            : `Привет! Я готова общаться. Спроси меня о чем-нибудь!`);
    }
  };

  // Компонент для сообщения
  const Message = ({ message }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`max-w-[80%] mx-auto p-4 rounded-3xl mb-4 ${
        message.role === "user" 
          ? "bg-purple-600 self-end text-right rounded-br-none" 
          : "bg-pink-600 self-start text-left rounded-tl-none"
      } shadow-xl backdrop-blur-xs`}>
      {message.image ? (
        <a href={message.image} target="_blank" rel="noopener noreferrer">
          <img src={message.image} alt="Generated Photo" className="rounded-lg mb-2 max-h-64 w-auto object-cover cursor-pointer" />
        </a>
      ) : null}
      <p className="text-lg leading-relaxed whitespace-pre-wrap">{message.content}</p>
      {message.role === "assistant" && isSpeaking && audioRef.current?.src && (
        <Volume2 className="w-4 h-4 mt-2 animate-pulse" />
      )}
    </motion.div>
  );


  const renderStep = () => {
    // ... (UI для welcome, orientation, mode, nsfw, test остается без изменений) ...
    const questions = [
        { q: "Характер:", a: ["Нежная", "Дерзкая", "Загадочная", "Спортивная"] },
        { q: "Волосы:", a: ["Блонд", "Тёмные", "Рыжие", "Цветные"] },
        { q: "Фигура:", a: ["Стройная", "Пышная", "Атлетичная", "Миниатюрная"] },
        { q: "Стиль:", a: ["Элегантный", "Кэжуал", "Сексуальный", "Спортивный"] },
    ];

    if (step === "welcome") {
        return (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-pink-400" />
                <h1 className="text-4xl font-bold mb-4">Neon Glow AI</h1>
                <p className="text-xl mb-8">Создай своего идеального цифрового спутника.</p>
                <button onClick={() => setStep("gender")} className="bg-white text-black text-2xl font-bold py-4 px-8 rounded-full shadow-lg transition hover:scale-105">Начать</button>
            </motion.div>
        );
    }
    
    if (step === "gender") {
        return (
            <motion.div key="gender" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-8">Кого ты хочешь видеть?</h2>
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                    <button onClick={() => handleSelect('gender', 'Женщина')} className="bg-pink-500 text-white text-xl py-3 rounded-xl transition hover:bg-pink-400">Женщину</button>
                    <button onClick={() => handleSelect('gender', 'Мужчина')} className="bg-purple-500 text-white text-xl py-3 rounded-xl transition hover:bg-purple-400">Мужчину</button>
                </div>
            </motion.div>
        );
    }

    if (step === "orientation") {
        return (
            <motion.div key="orientation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-8">Твоя ориентация?</h2>
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                    <button onClick={() => handleSelect('orientation', 'Гетеро')} className="bg-white/20 text-white text-xl py-3 rounded-xl transition hover:bg-white/30">Гетеро</button>
                    <button onClick={() => handleSelect('orientation', 'Би')} className="bg-white/20 text-white text-xl py-3 rounded-xl transition hover:bg-white/30">Би</button>
                    <button onClick={() => handleSelect('orientation', 'Мне всё равно')} className="bg-white/20 text-white text-xl py-3 rounded-xl transition hover:bg-white/30">Мне всё равно</button>
                </div>
            </motion.div>
        );
    }

    if (step === "mode") {
        return (
            <motion.div key="mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-8">Как ты хочешь общаться?</h2>
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                    <button onClick={() => handleSelect('mode', 'flirt')} className="bg-red-500 text-white text-xl py-3 rounded-xl transition hover:bg-red-400">Флирт / Романтика</button>
                    <button onClick={() => handleSelect('mode', 'friend')} className="bg-blue-500 text-white text-xl py-3 rounded-xl transition hover:bg-blue-400">Дружба / Советы</button>
                </div>
            </motion.div>
        );
    }

    if (step === "nsfw") {
        return (
            <motion.div key="nsfw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-8">Тема 18+?</h2>
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                    <button onClick={() => handleNsfw(true)} className="bg-red-800 text-white text-xl py-3 rounded-xl transition hover:bg-red-700">ДА (Откровенное общение)</button>
                    <button onClick={() => handleNsfw(false)} className="bg-green-600 text-white text-xl py-3 rounded-xl transition hover:bg-green-500">НЕТ (Только флирт/дружба)</button>
                </div>
            </motion.div>
        );
    }

    if (step === "test") {
        const currentQuestionIndex = Object.keys(personality.testAnswers).length;
        const currentQuestion = questions[currentQuestionIndex];
        
        if (!currentQuestion) return null;

        return (
            <motion.div key={`test-${currentQuestionIndex}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Настройка образа ({currentQuestionIndex + 1}/4)</h2>
                <p className="text-xl mb-8 font-semibold">{currentQuestion.q}</p>
                <div className="flex flex-col gap-4 max-w-sm mx-auto">
                    {currentQuestion.a.map((answer, index) => (
                        <button key={index} onClick={() => handleTestAnswer(currentQuestionIndex, answer)} className="bg-white/10 text-white text-xl py-3 rounded-xl transition hover:bg-white/20">
                            {answer}
                        </button>
                    ))}
                </div>
            </motion.div>
        );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 w-[100vw] min-h-[100dvh] bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex flex-col">
      {/* Плеер для TTS - Скрыт */}
      <audio ref={audioRef} />

      <AnimatePresence mode="wait">
        <div className="flex-1 flex flex-col w-full">

          {/* Шаги настройки */}
          {(step !== "chat") && (
            <motion.div key="steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-center items-center">
                {renderStep()}
            </motion.div>
          )}

          {/* Чат */}
          {step === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1">
              
              {/* Header */}
              <div className="p-4 bg-black/50 border-b border-white/20">
                  <h2 className="text-3xl font-bold text-center">Твой {personality.gender === "Женщина" ? "спутник" : "спутник"}</h2>
                  <p className="text-center text-sm text-gray-400">Режим: {personality.mode === 'flirt' ? 'Романтика' : 'Дружба'} | NSFW: {personality.nsfw ? 'Вкл.' : 'Выкл.'}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col custom-scrollbar">
                {messages.map((msg, index) => (
                  <Message key={index} message={msg} />
                ))}
                {(loading || generatingPhoto) && (
                  <div className="self-start p-4 bg-pink-600 rounded-3xl rounded-tl-none mb-4 shadow-xl backdrop-blur-xs w-fit">
                    <div className="dot-flashing"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Панель ввода */}
              <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                <div className="max-w-4xl mx-auto flex gap-3 items-center">
                  
                  {/* Основное поле ввода */}
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} 
                    placeholder="Напиши что-нибудь..." 
                    className="flex-1 px-4 py-3 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 text-xl focus:outline-none focus:border-pink-400"
                    disabled={loading || isRecording}/>
                  
                  {/* Кнопка "Секреты" */}
                  <button onClick={() => {
                      const cmds = personality.nsfw
                       ? ["раздевайся", "стон", "хочу тебя", "фото"] 
                      : ["расскажи шутку", "как дела?", "обними"];
                    setInput(cmds[Math.floor(Math.random() * cmds.length)]);
                  }} disabled={loading || isRecording} className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105 transition disabled:opacity-50" title="Вставить случайную команду/секрет">
                    <Heart className="w-6 h-6" />
                  </button>
                  
                  {/* Кнопка "Камера" для фото */}
                  <button onClick={() => generatePhoto()} disabled={generatingPhoto || loading || isRecording} className="p-3 rounded-full bg-gradient-to-r from-red-600 to-pink-600 disabled:opacity-50 hover:scale-105 transition" title="Сгенерировать фото">
                    <Camera className="w-6 h-6" />
                  </button>
                  
                  {/* Кнопка "Микрофон" для записи */}
                  <button onClick={isRecording ? stopRecording : startRecording} disabled={loading} 
                    className={`p-3 rounded-full transition ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-blue-600 to-purple-600'} disabled:opacity-50 hover:scale-105`} title={isRecording ? "Остановить запись" : "Голосовой ввод"}>
                    {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  {/* Кнопка "Отправить" */}
                  <button onClick={() => sendMessage()} disabled={loading || !input.trim() || isRecording} className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50 hover:scale-105 transition" title="Отправить сообщение">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
