// Файл: page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isRecording, setIsRecording] = useState(false); // НОВОЕ: Состояние записи
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null); 
  
  // НОВОЕ: Переменные для записи голоса
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
      window.Telegram.WebApp.setHeaderColor('#000000');
      window.Telegram.WebApp.setBackgroundColor('#000000');
    }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsSpeaking(false);
    if (audio) { audio.addEventListener('ended', handleEnded); }
    return () => { if (audio) { audio.removeEventListener('ended', handleEnded); } };
  }, []);


  // БЛОК 2 — Функция синтеза речи (ElevenLabs)
  const speak = async (text) => {
    if (!text || isSpeaking) return;

    // Выбираем ElevenLabs Voice ID (Замени на свои!)
    const voiceId = personality.gender === "Мужчина"
      ? "voice_id_for_male" // ID мужского голоса
      : personality.nsfw ? "voice_id_for_nsfw_female" : "voice_id_for_friendly_female"; // ID женского/nsfw голоса
      
    setIsSpeaking(true);
    
    try {
      // ИСПРАВЛЕНИЕ: Путь к API корректен для App Router, используется ElevenLabs
      const res = await fetch("/api/tts", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId }),
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
  };


  // БЛОК 3 — Генерация фото (Replicate)
  const generatePhoto = async (customPrompt = null) => {
    if (generatingPhoto) return;
    setGeneratingPhoto(true);
    
    const basePromptParts = Object.values(personality.testAnswers).filter(Boolean);
    const base = basePromptParts.length > 0 
        ? basePromptParts.join(", ") 
        : (personality.gender === "Мужчина" ? "красивый парень" : "красивая девушка");
        
    const finalPrompt = customPrompt || base;
    
    try {
      // ИСПРАВЛЕНИЕ: Используется Replicate API
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
  };


  // БЛОК 4 — Функции записи голоса (STT)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); // Формат для GROQ/Whisper
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
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Не удалось получить доступ к микрофону. Проверьте разрешения.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Логика sendAudioToSTT вызывается в mediaRecorder.onstop
    }
  };

  const sendAudioToSTT = async (audioBlob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_message.webm');
      
      // ИСПРАВЛЕНИЕ: Используется новый GROQ STT API
      const res = await fetch('/api/stt', {
        method: 'POST',
        body: formData, // FormData отправляется напрямую
      });

      if (!res.ok) throw new Error('STT failed');

      const data = await res.json();
      const transcribedText = data.text;

      if (transcribedText) {
        setInput(transcribedText); // Вставляем распознанный текст в инпут
        await sendMessage(transcribedText); // И отправляем его
      } else {
        alert("Не удалось распознать речь. Попробуйте еще раз.");
      }
      
    } catch (error) {
      console.error('STT API error:', error);
      alert("Ошибка распознавания речи.");
    } finally {
      setLoading(false);
    }
  };
  

  // БЛОК 5 — Отправка сообщения
  const sendMessage = async (customInput = null) => {
    const userMsg = (customInput || input).trim();
    if (!userMsg || loading) return;
    
    // Очищаем инпут только если отправляем из него
    if (!customInput) setInput(""); 

    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    if (await handleSecretCommand(userMsg)) {
      setLoading(false);
      return;
    }

    try {
      // ИСПРАВЛЕНИЕ: Используется Horde Chat API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, personality }),
      });
      if (!res.ok) throw new Error("Chat API failed");

      const data = await res.json();
      const reply = data.reply || (personality.nsfw ? "Аххх... даа..." : "Я рядом ❤️"); 
      
      setMessages(m => [...m, { role: "assistant", content: reply }]);
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
  };
  
  // БЛОК 6 — Функции для UI (Кнопка "Сердце")
  const handleRandomCommand = () => {
    const cmds = personality.nsfw
        ? ["фото", "раздевайся", "стон", "хочу тебя", "на колени", "кончи"]
        : (personality.gender === "Мужчина" 
            ? ["расскажи шутку", "как дела?", "ты крутой", "обними"]
            : ["расскажи шутку", "как дела?", "ты красивая", "обними"]);
    setInput(cmds[Math.floor(Math.random() * cmds.length)]); 
  };
  
  // БЛОК 7 — Рендеринг (тот же, что и раньше, но с фиксом записи)
  return (
    <div className="fixed inset-0 w-[100vw] min-h-[100dvh] bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex flex-col">
      <audio ref={audioRef} />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 blur-3xl animate-pulse" />
      </div>
      <AnimatePresence mode="wait">
        <div className="flex-1 flex flex-col w-full">

          {/* Welcome, Setup - без изменений */}
          {step === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 p-6">
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-center">
                <h1 className="text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">Neon Glow AI</h1>
                <p className="text-2xl mb-12 opacity-80">Твой 18+ цифровой спутник</p>
                <Sparkles className="w-32 h-32 mx-auto mb-12 text-pink-400 animate-pulse" />
              </motion.div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={() => setStep("setup")}
                className="px-20 py-10 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 text-4xl font-bold shadow-2xl shadow-pink-500/70 border-4 border-pink-400/60">
                Создать своего AI
              </motion.button>
            </motion.div>
          )}

          {step === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 overflow-y-auto bg-black/90 backdrop-blur-xl p-6 pt-20 pb-40">
              <div className="max-w-2xl mx-auto space-y-16">
                <h2 className="text-center text-5xl font-bold">Настрой своего AI</h2>
                {/* ПОЛ */}
                {!personality.gender && (
                  <div className="grid grid-cols-1 gap-8">
                    {["Мужчина", "Женщина", "Нейтральный"].map(g => (
                      <motion.button key={g} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setPersonality(p => ({ ...p, gender: g }))}
                        className={`p-12 rounded-3xl backdrop-blur border-4 ${
                          g === "Женщина" ? "border-pink-400 bg-pink-900/40" :
                          g === "Мужчина" ? "border-cyan-400 bg-cyan-900/30" :
                          "border-purple-400 bg-purple-900/30"
                        } shadow-2xl`}>
                        <div className="text-6xl mb-4">
                          {g === "Мужчина" ? "♂" : g === "Женщина" ? "♀" : "⚪"}
                        </div>
                        <div className="text-3xl font-bold">{g}</div>
                      </motion.button>
                    ))}
                  </div>
                )}
                {/* ОРИЕНТАЦИЯ */}
                {personality.gender && !personality.orientation && (
                  <div className="flex flex-wrap justify-center gap-6">
                    {["Гетеро", "Би", "Гей/Лесби", "Мне всё равно"].map(o => (
                      <motion.button key={o} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setPersonality(p => ({ ...p, orientation: o }))}
                        className="px-10 py-5 rounded-full bg-white/10 backdrop-blur border-2 border-white/30 hover:border-pink-400 text-xl">
                        {o}
                      </motion.button>
                    ))}
                  </div>
                )}
                {/* РЕЖИМ */}
                {personality.orientation && !personality.mode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <motion.div whileHover={{ scale: 1.05 }} onClick={() => setPersonality(p => ({ ...p, mode: "friend" }))}
                      className="p-16 rounded-3xl backdrop-blur border-4 border-cyan-400 bg-cyan-900/30 cursor-pointer text-center">
                      <MessageCircle className="w-32 h-32 mx-auto mb-6 text-cyan-300" />
                      <h3 className="text-5xl font-bold">Дружеский</h3>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} onClick={() => setPersonality(p => ({ ...p, mode: "flirt" }))}
                      className="p-16 rounded-3xl backdrop-blur border-4 border-pink-400 bg-pink-900/40 cursor-pointer text-center">
                      <Heart className="w-32 h-32 mx-auto mb-6 text-pink-300 animate-pulse" />
                      <h3 className="text-5xl font-bold">Флирт 18+</h3>
                    </motion.div>
                  </div>
                )}
                {/* NSFW */}
                {personality.mode === "flirt" && !personality.testDone && ( 
                  <div className="p-10 rounded-3xl bg-red-900/60 border-4 border-red-500 backdrop-blur-xl">
                    <p className="text-3xl text-center mb-8">18+ режим</p>
                    <div className="grid grid-cols-2 gap-8">
                      <button onClick={() => setPersonality(p => ({ ...p, nsfw: false }))}
                        className={`py-8 rounded-2xl text-2xl font-bold ${!personality.nsfw ? "bg-white/20 border-4 border-white" : "bg-black/50"}`}>
                        Обычный
                      </button>
                      <button onClick={() => setPersonality(p => ({ ...p, nsfw: true }))}
                        className={`py-8 rounded-2xl text-2xl font-bold ${personality.nsfw ? "bg-red-600 border-4 border-red-400 shadow-2xl shadow-red-500/70" : "bg-black/50"}`}>
                        Без цензуры
                      </button>
                    </div>
                    {personality.nsfw && <p className="text-center mt-6 text-red-300 text-xl">Фото и голос станут ОЧЕНЬ откровенными</p>}
                  </div>
                )}
                {/* ТЕСТ ЛИЧНОСТИ */}
                {personality.mode && !personality.testDone && ( 
                  <div className="space-y-10">
                    <h3 className="text-4xl font-bold text-center">Расскажи о себе</h3>
                    {[
                      { q: "Характер?", a: ["Нежная", "Смелая", "Шаловливая", "Таинственная"] },
                      { q: "Цвет волос?", a: ["Блонд", "Брюнетка", "Рыжая", "Чёрные"] },
                      { q: "Фигура?", a: ["Худенькая", "Спортивная", "Сочная", "Идеальная"] },
                      { q: "Стиль?", a: ["Нежный", "Готический", "Киберпанк", "Белье"] },
                    ].map((item, i) => (
                      <div key={i} className="backdrop-blur bg-white/10 rounded-3xl p-8 border border-white/20">
                        <p className="text-2xl mb-6">{item.q}</p>
                        <div className="grid grid-cols-2 gap-4">
                          {item.a.map(ans => (
                            <button key={ans} onClick={() => setPersonality(p => ({ ...p, testAnswers: { ...p.testAnswers, [i]: ans } }))}
                              className={`py-5 rounded-xl transition ${personality.testAnswers[i] === ans ? "bg-pink-600" : "bg-white/10"} border border-white/20 hover:bg-pink-500/30`}>
                              {ans}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { setPersonality(p => ({ ...p, testDone: true })); setStep("chat"); }}
                      className="w-full py-10 rounded-full bg-gradient-to-r from-pink-600 to-red-600 text-4xl font-bold shadow-2xl">
                      Создать моего AI
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Чат */}
          {step === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1">
              <div className="p-6 text-center border-b border-white/10 flex justify-between items-center">
                <button onClick={() => setStep("setup")} className="text-sm opacity-70 hover:opacity-100 transition">
                    ← Назад
                </button>
                <h2 className="text-4xl font-bold">Твой AI</h2>
                <div className="w-16 flex justify-end">
                    <button onClick={() => audioRef.current.src && audioRef.current.play()} disabled={isSpeaking} className={`p-2 rounded-full transition ${isSpeaking ? 'bg-pink-600 animate-pulse' : 'bg-white/10'}`}>
                        <Volume2 className="w-6 h-6" />
                    </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-md px-6 py-4 rounded-3xl backdrop-blur-xl border-2 ${
                      m.role === "user" ? "bg-white/20 border-white/30" :
                       personality.nsfw ? "bg-red-900/50 border-red-500" : "bg-pink-900/40 border-pink-400/50"
                    }`}>
                      {m.image ? <img src={m.image} alt="AI" className="rounded-2xl max-w-full" /> : m.content}
                    </div>
                  </motion.div>
                ))}
                {(loading || isRecording) && <div className={`flex justify-start`}>
                   <div className={`max-w-md px-6 py-4 rounded-3xl backdrop-blur-xl border-2 ${personality.nsfw ? "bg-red-900/50 border-red-500" : "bg-pink-900/40 border-pink-400/50"} animate-pulse text-2xl`}>
                        {isRecording ? "Идёт запись..." : (personality.gender === "Мужчина" ? "Думаю, детка..." : "Думаю, малыш...")}
                   </div>
                </div>}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Панель ввода */}
              <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                <div className="max-w-4xl mx-auto flex gap-3">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Напиши что-нибудь..." className="flex-1 px-4 py-3 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 text-xl focus:outline-none focus:border-pink-400"/>
                  
                  {/* Кнопка "Сердце" (Команды/Секреты) */}
                  <button onClick={handleRandomCommand} disabled={loading || isRecording} className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105 transition disabled:opacity-50" title="Вставить случайную команду/секрет">
                    <Heart className="w-6 h-6" />
                  </button>
                  
                  {/* Кнопка "Камера" для фото */}
                  <button onClick={generatePhoto} disabled={generatingPhoto || loading || isRecording} className="p-3 rounded-full bg-gradient-to-r from-red-600 to-pink-600 disabled:opacity-50 hover:scale-105 transition" title="Сгенерировать фото">
                    <Camera className="w-6 h-6" />
                  </button>
                  
                  {/* Кнопка "Микрофон" (Голосовой ввод - STT) */}
                  <button onClick={isRecording ? stopRecording : startRecording} disabled={loading} 
                    className={`p-3 rounded-full transition ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-blue-600 to-purple-600'} disabled:opacity-50 hover:scale-105`} title={isRecording ? "Остановить запись" : "Голосовой ввод"}>
                    {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  {/* Кнопка "Сообщение" для отправки */}
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
