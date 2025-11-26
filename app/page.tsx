"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSend, FiVolume2, FiMic, FiCamera } from "react-icons/fi"; // Иконки

// -------------------------
// Типы (должны совпадать с app/setup/page.tsx)
// -------------------------
interface AiSettings {
    gender: 'male' | 'female' | 'neutral';
    orientation: 'hetero' | 'bi' | 'gay_lesbian' | 'universal';
    style: 'chat' | 'flirt';
    intensity: number;
    timestamp: number;
}

export default function Page() {
    const router = useRouter();
    
    // --- Состояние настроек и перенаправление ---
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [aiSettings, setAiSettings] = useState<AiSettings | null>(null);

    // Проверка настроек при загрузке
    useEffect(() => {
        const storedSettings = localStorage.getItem("aiSettings");
        if (storedSettings) {
            const settings = JSON.parse(storedSettings) as AiSettings;
            setAiSettings(settings);
            setIsSetupComplete(true);
        } else {
            // 1. Если настроек нет, перенаправляем на страницу настройки
            router.replace("/setup");
        }
    }, [router]);

    // --- Core Functionality States (Ваши старые состояния) ---
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);

    const [ttsLoading, setTtsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const [sttLoading, setSttLoading] = useState(false);
    const [sttResult, setSttResult] = useState<string | null>(null);

    const [analyzeLoading, setAnalyzeLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const audioInputRef = useRef<HTMLInputElement | null>(null);
    const imageAnalyzeRef = useRef<HTMLInputElement | null>(null);
    
    // --- Условные стили на основе настроек ---
    const isFlirty = aiSettings?.style === 'flirt';
    const accentColor = isFlirty ? 'pink-500' : 'blue-500';
    const accentShadow = isFlirty ? 'shadow-[0_0_15px_rgba(255,105,180,0.8)]' : 'shadow-[0_0_15px_rgba(59,130,246,0.8)]';
    const inputGlow = isFlirty ? 'focus:ring-pink-500 focus:border-pink-500' : 'focus:ring-blue-500 focus:border-blue-500';

    if (!isSetupComplete || !aiSettings) {
        // Заглушка при ожидании или перенаправлении
        return (
            <div className="flex justify-center items-center h-screen" 
                 style={{ background: 'linear-gradient(135deg, #1A0033 0%, #4C00FF 100%)' }}>
                <div className="text-white text-xl animate-pulse">
                    Загрузка... Проверка настроек AI...
                </div>
            </div>
        );
    }
    
    // ----------------------------------------------
    // --- Обработчики API (Скорректировано для Fast API) ---
    // ----------------------------------------------

    // 1. Generate Image
    const handleGenerateImage = async () => {
        if (!prompt.trim()) return alert("Введите prompt для генерации изображения");

        setImageLoading(true);
        setImageUrl(null);
        try {
            const finalPrompt = `Generate a cinematic image for a ${aiSettings.style} companion (Gender: ${aiSettings.gender}, Orientation: ${aiSettings.orientation}, Intensity: ${aiSettings.intensity}). Subject: ${prompt}`;
            
            const resp = await fetch("/api/image_generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: finalPrompt }),
            });

            if (!resp.ok) {
                const errorData = await resp.json();
                throw new Error(errorData.detail || "Ошибка генерации изображения");
            }

            const data = await resp.json();
            
            // API должен вернуть { isUrl: true, data: '...' }
            if (data.isUrl && data.data) {
                setImageUrl(data.data);
            } else {
                alert("API вернул неверный формат URL.");
            }
        } catch (error: any) {
            alert(`Ошибка: ${error.message}`);
        } finally {
            setImageLoading(false);
        }
    };

    // 2. Text to Speech (TTS)
    const handleTextToSpeech = async () => {
        if (!sttResult || !sttResult.trim()) return alert("Сначала распознайте речь (STT).");

        setTtsLoading(true);
        setAudioUrl(null);
        try {
            const resp = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: sttResult }),
            });

            if (!resp.ok) {
                throw new Error("Ошибка TTS: API вернул не 200");
            }

            const audioBlob = await resp.blob();
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);

        } catch (error: any) {
            alert(`Ошибка: ${error.message}`);
        } finally {
            setTtsLoading(false);
        }
    };

    // 3. Speech to Text (STT)
    const handleSpeechToText = async () => {
        if (!audioInputRef.current?.files?.length) return alert("Выберите аудиофайл");

        setSttLoading(true);
        setSttResult(null);
        const formData = new FormData();
        formData.append("file", audioInputRef.current.files[0]);

        try {
            const resp = await fetch("/api/stt", {
                method: "POST",
                body: formData,
            });

            if (!resp.ok) {
                const errorData = await resp.json();
                throw new Error(errorData.detail || "Ошибка STT");
            }

            const data = await resp.json();
            setSttResult(data.text);
        } catch (error: any) {
            alert(`Ошибка STT: ${error.message}`);
        } finally {
            setSttLoading(false);
        }
    };
    
    // 4. Image Analysis
    const handleAnalyzeImage = async () => {
        if (!imageAnalyzeRef.current?.files?.length) return alert("Выберите файл изображения для анализа");

        setAnalyzeLoading(true);
        setAnalysisResult(null);
        
        const formData = new FormData();
        formData.append("file", imageAnalyzeRef.current.files[0]);
        formData.append("prompt", `Analyze this image in the style of a ${aiSettings.style} companion (Intensity: ${aiSettings.intensity}%). Describe it in detail.`);

        try {
            const resp = await fetch("/api/image_analyze", {
                method: "POST",
                body: formData,
            });

            if (!resp.ok) {
                const errorData = await resp.json();
                throw new Error(errorData.detail || "Ошибка анализа изображения");
            }

            const data = await resp.json();
            setAnalysisResult(data.description);
        } catch (error: any) {
            alert(`Ошибка: ${error.message}`);
        } finally {
            setAnalyzeLoading(false);
        }
    };


    // ----------------------------------------------
    // --- JSX (Интерфейс) ---
    // ----------------------------------------------

    return (
        <div className="min-h-screen p-6 text-white" 
             style={{ background: 'linear-gradient(135deg, #1A0033 0%, #4C00FF 100%)' }}>
            <style jsx global>{`
                /* Анимация парения для заголовка */
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-2px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
            <header className="text-center mb-10">
                <h1 className={`text-4xl font-extrabold mb-2 drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-400 ${accentShadow}`} style={{animation: 'float 2s ease-in-out infinite'}}>
                    Neon Glow AI Chat
                </h1>
                <p className="text-lg text-white/80">
                    AI-Компаньон ({aiSettings.gender}, {aiSettings.orientation}) в режиме: 
                    <span className={`font-bold ml-1 text-${accentColor}`}>{aiSettings.style.toUpperCase()}</span> (Интенсивность: {aiSettings.intensity}%)
                    <button onClick={() => router.push("/setup")} className="ml-3 text-sm text-yellow-400 hover:underline">
                        (Изменить)
                    </button>
                </p>
            </header>

            {/* General Chat / Main Input Section */}
            <section className="max-w-xl mx-auto mb-10 p-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm shadow-2xl">
                <h2 className="text-2xl font-semibold mb-4 text-center">Главный Чат</h2>
                
                {/* Input Field */}
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={isFlirty ? "Что ты хочешь обсудить, дорогой/дорогая? 😉" : "Задайте вопрос AI-ассистенту..."}
                        className={`w-full p-3 rounded-xl border border-white/20 bg-black/30 text-white placeholder-gray-400 transition-all ${inputGlow}`}
                    />
                    <button
                        onClick={() => alert(`Вызов /api/chat с контекстом: ${aiSettings.style}`)} // Здесь будет логика CHAT
                        className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all ${accentShadow}`}
                    >
                        <FiSend size={24} />
                    </button>
                </div>
            </section>

            {/* Image Generation */}
            <section className="max-w-xl mx-auto mb-10 p-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm shadow-2xl">
                <h2 className="text-xl font-semibold mb-4 text-pink-400 flex items-center">
                    <FiCamera className="mr-2" /> Генерация Изображений
                </h2>

                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Опишите, что должен нарисовать AI..."
                        className={`w-full p-3 rounded-xl border border-white/20 bg-black/30 text-white placeholder-gray-400 transition-all ${inputGlow}`}
                    />
                    <button
                        onClick={handleGenerateImage}
                        disabled={imageLoading}
                        className={`p-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all ${imageLoading ? 'opacity-50' : ''}`}
                    >
                        {imageLoading ? '...' : 'Создать'}
                    </button>
                </div>

                <div className="mt-5 text-center">
                    {imageLoading && <div className="animate-pulse text-yellow-400">Генерация... подождите</div>}
                    {imageUrl && (
                        <div className="mt-3 inline-block p-2 border border-white/20 rounded-lg">
                            <img src={imageUrl} alt="Generated AI Image" className="max-w-full h-auto rounded-lg" style={{ maxHeight: '300px' }} />
                        </div>
                    )}
                </div>
            </section>

            {/* STT and TTS */}
            <section className="max-w-xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Speech to Text (STT) */}
                <div className="p-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm shadow-2xl">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                        <FiMic className="mr-2" /> Голос в Текст
                    </h2>
                    <input type="file" ref={audioInputRef} accept="audio/*" className="w-full text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/50 file:text-white" />
                    <button
                        onClick={handleSpeechToText}
                        disabled={sttLoading}
                        className="w-full mt-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all"
                    >
                        {sttLoading ? 'Распознавание...' : 'Распознать Голос'}
                    </button>
                    {sttResult && <div className="mt-3 p-3 bg-white/20 rounded text-sm whitespace-pre-wrap">{sttResult}</div>}
                </div>

                {/* Text to Speech (TTS) */}
                <div className="p-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm shadow-2xl">
                    <h2 className="text-xl font-semibold mb-4 text-purple-400 flex items-center">
                        <FiVolume2 className="mr-2" /> Текст в Голос
                    </h2>
                    <p className="text-sm text-white/70 mb-3">На основе распознанного текста.</p>
                    <button
                        onClick={handleTextToSpeech}
                        disabled={ttsLoading || !sttResult}
                        className="w-full py-2 rounded-xl bg-purple-500 hover:bg-purple-600 transition-all"
                    >
                        {ttsLoading ? 'Генерация Аудио...' : 'Сгенерировать Голос'}
                    </button>
                    {audioUrl && (
                        <div className="mt-3">
                            <audio controls src={audioUrl} className="w-full"></audio>
                        </div>
                    )}
                </div>
            </section>
            
            {/* Image Analysis */}
            <section className="max-w-xl mx-auto mb-10 p-6 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm shadow-2xl">
                <h2 className="text-xl font-semibold mb-4 text-yellow-400 flex items-center">
                    <FiCamera className="mr-2" /> Анализ Изображений
                </h2>
                
                <input type="file" ref={imageAnalyzeRef} accept="image/*" className="w-full text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/50 file:text-white" />
                
                <button
                    onClick={handleAnalyzeImage}
                    disabled={analyzeLoading}
                    className="w-full mt-3 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 transition-all"
                >
                    {analyzeLoading ? 'Анализ...' : 'Анализировать Изображение'}
                </button>

                <div className="mt-5">
                    {analysisResult && (
                        <div className="p-3 bg-white/20 rounded">
                            <strong>AI Описание:</strong>
                            <div className="mt-2 whitespace-pre-wrap text-sm">{analysisResult}</div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
