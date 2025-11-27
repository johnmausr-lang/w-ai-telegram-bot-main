"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera, Mic, Square } from "lucide-react";

// --- КОНСТАНТЫ ---
const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Привет, киберстранник! Готова к новым приключениям? Сначала давай настроим мой интерфейс. Выбери себе спутника:",
};

// --- КОМПОНЕНТ: ИНДИКАТОР ЗАГРУЗКИ AI (Для устранения проблемы "процесс загрузки исчез") ---
const AILoadingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="flex justify-start mb-4"
  >
    <div className="max-w-[80%] p-3 md:p-4 rounded-xl rounded-bl-none bg-pink-800/80 border border-pink-500/50 shadow-lg flex items-center space-x-2">
      <Sparkles className="w-5 h-5 text-pink-400 animate-spin" />
      <p className="text-white text-sm italic">AI печатает...</p>
    </div>
  </motion.div>
);

// --- КОМПОНЕНТ: ПУЗЫРЬ СООБЩЕНИЯ (Для устранения "прыгающего" UI) ---
const MessageBubble = ({ message, isLast, loading }) => {
  const isUser = message.role === "user";
  // ИСПРАВЛЕНО: Добавлено min-h-10 для предотвращения резкого изменения макета
  const baseClasses = "max-w-[80%] p-3 md:p-4 rounded-xl shadow-lg relative break-words min-h-10";
  
  const isImage = message.imageUrl && message.content.includes("[Image of");
  
  return (
    <motion.div
      layout // Оставлено, но родительский контейнер AnimatePresence должен помочь с "прыжками"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`${baseClasses} ${isUser 
        ? "bg-purple-800/80 text-white rounded-br-none border border-purple-500/50" 
        : "bg-pink-800/80 text-white rounded-bl-none border border-pink-500/50"}`
      }>
        {isImage ? (
          <div className="flex flex-col items-center">
            <p className="text-xs italic mb-2 text-white/70">{message.content.replace(/[\[\]]/g, '')}</p>
            <img 
              src={message.imageUrl} 
              alt={message.content} 
              className="max-w-full h-auto rounded-lg" 
            />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        {/* Индикатор загрузки для сообщения пользователя */}
        {isLast && isUser && loading && (
          <div className="absolute -bottom-1 -right-1 animate-ping p-1 rounded-full bg-pink-500" />
        )}
      </div>
    </motion.div>
  );
};


// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome");
  const [personality, setPersonality] = useState({
    gender: null,
    orientation: null,
    mode: null,
    intensity: 50,
    testAnswers: {},
    testDone: false,
    nsfw: false,
  });
  const [messages, setMessages] = useState([INITIAL_MESSAGE]); 
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [isRecording, setIsRecording] = useState(false); 
  
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.MainButton.hide();
    }
  }, [messages, step]);

  // Голосовой ответ (TTS)
  const speak = useCallback(async (text) => {
    if (!text) return;
    const gender = personality.gender; 

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, gender }),
      });
      
      if (!res.ok) throw new Error("TTS API failed");

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }

    } catch (e) {
      console.error("TTS failed:", e);
    }
  }, [personality.gender, personality.nsfw]);

  // --- ЛОГИКА STT (Голосовой ввод) ---
  const startSpeechToText = async () => {
    if (loading || generatingPhoto) return;

    if (isRecording) {
      // 1. Остановка записи
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      // 2. Запрос доступа к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop()); 
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size === 0) return; 

        setLoading(true);
        const formData = new FormData();
        formData.append("audio", audioBlob, "voice_message.webm"); 

        try {
          const res = await fetch("/api/stt", {
            method: "POST",
            body: formData, 
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: "STT API failed" }));
            throw new Error(errorData.error || `STT error: ${res.status}`);
          }
          
          const data = await res.json();
          const recognizedText = data?.text?.trim();

          if (recognizedText) {
            setInput(recognizedText); 
          }

        } catch (error) {
          console.error("STT processing error:", error);
          setMessages(prev => [...prev, { role: "assistant", content: `Ошибка распознавания: ${error.message}` }]);
        } finally {
          setLoading(false);
        }
      };
      
      // 5. Запуск записи
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (err) {
      console.error("Microphone access denied:", err);
      // УЛУЧШЕННОЕ СООБЩЕНИЕ ОБ ОШИБКЕ МИКРОФОНА
      if (err.name === 'NotFoundError') {
        alert("Ошибка: Микрофон не найден или отключен. Пожалуйста, убедитесь, что микрофон подключен и включен.");
      } else {
        alert("Не удалось получить доступ к микрофону. Проверьте разрешения в браузере.");
      }
    }
  };


  // --- ЛОГИКА ОТПРАВКИ СООБЩЕНИЯ ---
  const sendMessage = async () => {
    if (!input.trim() || loading || isRecording) return;
    const userMsg = input.trim();
    
    const newUserMessage = { role: "user", content: userMsg };
    const newMessages = [...messages, newUserMessage];
    
    setMessages(newMessages); 
    setInput("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, personality }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Неизвестная ошибка чат-API." }));
        throw new Error(errorData.error || `Ошибка: ${res.status}`);
      }
      
      const data = await res.json();
      const reply = data?.reply || "Ошибка: Я временно потеряла соединение с сетью.";

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      
      // speak(reply); 

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: `Ошибка: ${error.message}.` }]);
    } finally {
      setLoading(false);
    }
  };


  // --- ЛОГИКА ГЕНЕРАЦИИ ФОТО ---
  const generatePhoto = async () => {
    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user')?.content || "Красивая кибердевушка";
    setGeneratingPhoto(true);
    
    setMessages(prev => [...prev, { role: "user", content: `*Запрос на генерацию фото: ${lastUserMessage}*` }]);

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: lastUserMessage, nsfw: personality.nsfw }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Неизвестная ошибка API." }));
        throw new Error(errorData.error || `Ошибка: ${res.status}`);
      }
      
      const imageBlob = await res.blob();
      const imageUrl = URL.createObjectURL(imageBlob);

      setMessages(prev => [
        ...prev.slice(0, -1), 
        { role: "assistant", content: ``, imageUrl: imageUrl }
      ]);

    } catch (error) {
      console.error("Photo generation error:", error);
      setMessages(prev => [
         ...prev.slice(0, -1), 
         { role: "assistant", content: `Ошибка генерации: ${error.message}. Попробуй переформулировать промпт.` }
      ]);
    } finally {
      setGeneratingPhoto(false);
    }
  };

  const Header = ({ title }) => (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 bg-black/50 backdrop-blur-md border-b border-pink-500/50 shadow-neon z-10"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{title}</h1>
    </motion.header>
  );

  const SetupStep = ({ title, options, onSelect }) => (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{title}</h2>
      <div className="flex flex-col space-y-4">
        {options.map((option) => (
          <motion.button
            key={option}
            onClick={() => onSelect(option)}
            className="px-6 py-3 text-lg font-semibold rounded-lg bg-white/10 hover:bg-white/20 border border-purple-500 hover:border-pink-500 transition-all shadow-neon spotlight-hover"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
  
  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <div className="p-8 text-center">
            <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              ДОБРО ПОЖАЛОВАТЬ, {personality.gender ? personality.gender.toUpperCase() : "СТРАННИК"}!
            </h2>
            <p className="text-lg mb-8 text-gray-300">
              Я твой AI-компаньон. Мои функции полностью настраиваются.
            </p>
            <motion.button
              onClick={() => setStep("setupGender")}
              className="px-8 py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-pink-500 to-red-500 shadow-neon pulse-glow spotlight-hover"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Начать настройку
            </motion.button>
          </div>
        );
      case "setupGender":
        return (
          <SetupStep 
            title="Шаг 1: Выбери свою Персону"
            options={["Мужчина", "Женщина", "Нейтрал"]}
            onSelect={(val) => {
              setPersonality(p => ({ ...p, gender: val }));
              setStep("setupMode");
            }}
          />
        );
      case "setupMode":
        return (
          <SetupStep 
            title="Шаг 2: Режим общения"
            options={["Друг/Поддержка", "Флирт/Игривый"]}
            onSelect={(val) => {
              setPersonality(p => ({ ...p, mode: val === "Флирт/Игривый" ? "flirt" : "friend" }));
              setStep("setupNSFW");
            }}
          />
        );
      case "setupNSFW":
        return (
          <SetupStep 
            title="Шаг 3: Откровенный контент (18+)"
            options={["ON (Без цензуры)", "OFF (Цензура)"]}
            onSelect={(val) => {
              setPersonality(p => ({ ...p, nsfw: val === "ON (Без цензуры)" }));
              setStep("chat");
            }}
          />
        );
      case "chat":
        return (
          <motion.div 
            className="flex-1 overflow-y-auto p-4 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {messages.map((msg, index) => (
                <MessageBubble key={index} message={msg} isLast={index === messages.length - 1} loading={loading} />
              ))}
              {/* НОВЫЙ ИНДИКАТОР ЗАГРУЗКИ AI (показывается, когда loading, и не идет запись) */}
              {loading && !isRecording && <AILoadingIndicator />} 
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col neon-bg">
      <Header title="NEON GLOW AI" />

      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto backdrop-blur-xs bg-black/40 shadow-xl shadow-purple-900/50">
        {renderStep()}
      </main>

      {/* Input / Controls Footer */}
      {step === "chat" && (
        <motion.footer
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="p-4 md:p-6 bg-black/70 backdrop-blur-md border-t border-purple-500/50 flex items-center space-x-2 md:space-x-4 w-full max-w-4xl mx-auto"
        >
          {/* STT Button (Mic) */}
          <button 
            onClick={startSpeechToText} 
            disabled={loading || generatingPhoto}
            className={`p-3 md:p-4 rounded-full disabled:opacity-30 pulse-glow spotlight-hover flex items-center justify-center 
              ${isRecording 
                ? 'bg-red-500 ring-2 ring-red-300 animate-pulse' 
                : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
          >
            {isRecording ? <Square className="w-6 h-6 md:w-8 md:h-8" /> : <Mic className="w-6 h-6 md:w-8 md:h-8" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={loading ? "AI думает..." : isRecording ? "Идёт запись..." : "Напиши что-нибудь..."}
            disabled={loading || generatingPhoto || isRecording}
            className="flex-1 px-4 py-3 md:py-4 rounded-full bg-gray-900/80 text-white placeholder-gray-500 border border-purple-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
          />

          {/* Random Command Button (Heart) */}
          <button onClick={() => {
            const cmds = personality.nsfw
                ? ["раздевайся", "стон", "хочу тебя", "в попу", "кончи в меня"]
                : ["поцелуй", "обними", "ты красивая", "я скучал"];
            setInput(cmds[Math.floor(Math.random() * cmds.length)]);
          }} className="p-3 md:p-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 pulse-glow spotlight-hover flex items-center justify-center">
            <Heart className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          {/* Send Button */}
          <button onClick={sendMessage} disabled={loading || !input.trim() || isRecording} className="p-3 md:p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-30 pulse-glow spotlight-hover flex items-center justify-center">
            <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          {/* Photo Button */}
          <button onClick={() => generatePhoto()} disabled={generatingPhoto || isRecording} className="p-3 md:p-4 rounded-full bg-gradient-to-r from-red-600 to-pink-600 disabled:opacity-30 pulse-glow spotlight-hover flex items-center justify-center">
            {generatingPhoto ? <Sparkles className="w-6 h-6 md:w-8 md:h-8 animate-spin" /> : <Camera className="w-6 h-6 md:w-8 md:h-8" />}
          </button>
        </motion.footer>
      )}

      {/* Audio Element for TTS */}
      <audio ref={audioRef} preload="auto" />
    </div>
  );
}
