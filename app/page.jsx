// Файл: page.jsx (Исправленная и дополненная версия)
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Убедитесь, что все иконки импортированы
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

  // Эффекты (остаются без изменений)
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
  // БЛОК ФУНКЦИЙ (Перестроен для устранения ошибки инициализации)
  // =========================================================================

  // 1. Speak - Самая низкая зависимость (вызывается другими, но не вызывает их)
  const speak = useCallback(async (text) => {
    if (!text || isSpeaking) return;
    const gender = personality.gender; 
      
    setIsSpeaking(true);
    
    try {
      const res = await fetch("/api/tts", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, gender }),
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


  // 2. GeneratePhoto - Зависит от speak
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

  
  // 3. HandleSecretCommand - Зависит от generatePhoto и speak
  const handleSecretCommand = useCallback(async (text) => {
    if (!personality.nsfw) return false;
    const lower = text.toLowerCase();
    
    // Внутри объекта secrets мы вызываем generatePhoto() и speak(), которые теперь определены выше.
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

  
  // 4. SendMessage - Зависит от handleSecretCommand и speak
  // Этот блок должен быть определен до sendAudioToSTT.
  const sendMessage = useCallback(async (customInput = null) => {
    const userMsg = (customInput || input).trim();
    if (!userMsg || loading) return;
    
    if (!customInput) setInput(""); 

    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    // Вызываем handleSecretCommand
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
      // Вызываем speak
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


  // 5. SendAudioToSTT - Зависит от sendMessage
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
        await sendMessage(transcribedText); // Вызываем sendMessage
      } else {
        setMessages(m => [...m, { role: "assistant", content: "Не удалось распознать речь." }]);
      }
      
    } catch (error) {
      console.error('STT API error:', error);
      setMessages(m => [...m, { role: "assistant", content: "Ошибка распознавания речи." }]);
    } finally {
      setLoading(false);
    }
  }, [sendMessage]); // personality убран, так как sendMessage имеет его в зависимостях

  // 6. StartRecording - Зависит от sendAudioToSTT
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' }); 
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToSTT(audioBlob); // Вызываем sendAudioToSTT
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
  // UI (Остаётся без изменений)
  // =========================================================================
  return (
    <div className="fixed inset-0 w-[100vw] min-h-[100dvh] bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex flex-col">
      <audio ref={audioRef} />
      {/* ... (остальной UI) ... */}

      <AnimatePresence mode="wait">
        <div className="flex-1 flex flex-col w-full">

          {/* Welcome, Setup - без изменений */}
          {/* ... */}
          
          {/* Чат */}
          {step === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col flex-1">
              {/* ... (Header и Messages) ... */}

              {/* Панель ввода */}
              <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                <div className="max-w-4xl mx-auto flex gap-3">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    // Здесь вызов sendMessage, который теперь корректно инициализирован
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()} 
                    placeholder="Напиши что-нибудь..." className="flex-1 px-4 py-3 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 text-xl focus:outline-none focus:border-pink-400"/>
                  
                  {/* Кнопки */}
                  {/* ... (Heart, Camera, Mic, Send) ... */}
                  <button onClick={() => {
                      const cmds = personality.nsfw
                       ? ["раздевайся", "стон", "хочу тебя"]
                      : ["расскажи шутку", "как дела?", "обними"];
                    setInput(cmds[Math.floor(Math.random() * cmds.length)]);
                  }} disabled={loading || isRecording} className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105 transition disabled:opacity-50" title="Вставить случайную команду/секрет">
                    <Heart className="w-6 h-6" />
                  </button>
                  
                  <button onClick={() => generatePhoto()} disabled={generatingPhoto || loading || isRecording} className="p-3 rounded-full bg-gradient-to-r from-red-600 to-pink-600 disabled:opacity-50 hover:scale-105 transition" title="Сгенерировать фото">
                    <Camera className="w-6 h-6" />
                  </button>
                  
                  <button onClick={isRecording ? stopRecording : startRecording} disabled={loading} 
                    className={`p-3 rounded-full transition ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-blue-600 to-purple-600'} disabled:opacity-50 hover:scale-105`} title={isRecording ? "Остановить запись" : "Голосовой ввод"}>
                    {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

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
