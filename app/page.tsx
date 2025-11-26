"use client";

import React, { useState, useRef } from "react";

// Вспомогательная функция для преобразования File объекта в Base64 строку
const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        // Извлекаем только Base64 строку (удаляем префикс "data:image/jpeg;base64,")
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
    };
    reader.onerror = error => reject(error);
});

// Основной компонент страницы
export default function Page() {
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

  // ====== 1. Generate Image (Генерация) ======
  const handleGenerateImage = async () => {
    if (!prompt.trim()) return alert("Введите prompt для генерации изображения");

    setImageLoading(true);
    setImageUrl(null);

    try {
      const resp = await fetch("/api/image_generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      // --- ОБРАБОТКА ОШИБОК ---
      if (!resp.ok) {
        const err = await resp.text();
        alert(`Ошибка генерации изображения: ${resp.status} - ${err}`);
        setImageLoading(false);
        return;
      }
      // -------------------------

      const data = await resp.json();
      // Получаем Base64 и создаем Data URL для отображения
      setImageUrl(`data:image/png;base64,${data.data}`);

    } catch (error) {
      alert(`Непредвиденная ошибка при генерации: ${error.message}`);
    } finally {
      setImageLoading(false);
    }
  };


  // ====== 2. Text-to-Speech (TTS) ======
  const handleTts = async () => {
    if (!sttResult?.trim()) return alert("Сначала выполните STT или введите текст.");

    setTtsLoading(true);
    setAudioUrl(null);

    try {
      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sttResult }),
      });

      // --- ОБРАБОТКА ОШИБОК ---
      if (!resp.ok) {
        const err = await resp.text();
        alert(`Ошибка TTS: ${resp.status} - ${err}`);
        setTtsLoading(false);
        return;
      }
      // -------------------------

      const data = await resp.json();
      // Получаем Base64 и создаем Data URL для тега <audio>
      setAudioUrl(`data:audio/mp3;base64,${data.data}`);

    } catch (error) {
      alert(`Непредвиденная ошибка при TTS: ${error.message}`);
    } finally {
      setTtsLoading(false);
    }
  };


  // ====== 3. Speech-to-Text (STT) ======
  const handleStt = async () => {
    if (!audioInputRef.current?.files?.length) return alert("Выберите аудиофайл для распознавания.");
    
    const audioFile = audioInputRef.current.files[0];

    setSttLoading(true);
    setSttResult(null);

    try {
        const file_data_b64 = await fileToBase64(audioFile); // Читаем файл в Base64
        
        const resp = await fetch("/api/stt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file_data_b64 }), // Отправляем Base64
        });

        // --- ОБРАБОТКА ОШИБОК ---
        if (!resp.ok) {
            const err = await resp.text();
            alert(`Ошибка STT: ${resp.status} - ${err}`);
            setSttLoading(false);
            return;
        }
        // -------------------------
        
        const data = await resp.json();
        setSttResult(data.text); 

    } catch (error) {
        alert(`Непредвиденная ошибка при STT: ${error.message}`);
    } finally {
        setSttLoading(false);
    }
  };


  // ====== 4. Analyze Image (Анализ) ======
  const handleAnalyzeImage = async () => {
    if (!fileInputRef.current?.files?.length) return alert("Выберите изображение для анализа.");

    const imageFile = fileInputRef.current.files[0];

    setAnalyzeLoading(true);
    setAnalysisResult(null);

    try {
        const file_data_b64 = await fileToBase64(imageFile); // Читаем файл в Base64

        const resp = await fetch("/api/image_analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                file_data_b64, // Отправляем Base64
                prompt: "Опиши это изображение, найди смешные детали и дай короткий комментарий от лица профессионального фотографа." // Расширенный промпт
            }),
        });
        
        // --- ОБРАБОТКА ОШИБОК ---
        if (!resp.ok) {
            const err = await resp.text();
            alert(`Ошибка анализа: ${resp.status} - ${err}`);
            setAnalyzeLoading(false);
            return;
        }
        // -------------------------

        const data = await resp.json();
        setAnalysisResult(data.text);
        
    } catch (error) {
        alert(`Непредвиденная ошибка при анализе: ${error.message}`);
    } finally {
        setAnalyzeLoading(false);
    }
  };


  return (
    <main className="min-h-screen p-5">
      <h1 className="text-3xl font-bold text-center mb-8">
        AI Mini App Demo
      </h1>

      <section className="max-w-xl w-full mx-auto p-4 bg-white shadow-lg rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-3">
          1. Генерация изображения (DALL-E 3)
        </h2>
        
        <textarea
          className="w-full p-2 border border-slate-300 rounded resize-none mb-3 focus:ring-purple-500 focus:border-purple-500"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Введите подробный запрос для генерации изображения..."
          disabled={imageLoading}
        />
        
        <button
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-purple-300 transition"
          onClick={handleGenerateImage}
          disabled={imageLoading || !prompt.trim()}
        >
          {imageLoading ? "Генерация..." : "Сгенерировать изображение"}
        </button>

        {/* Image result */}
        <div className="mt-5 text-center">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Сгенерированное изображение" 
              className="w-full max-h-96 object-contain rounded border border-slate-200"
            />
          )}
        </div>
      </section>
      
      
      {/* 2. STT и TTS */}
      <section className="max-w-xl w-full mx-auto p-4 bg-white shadow-lg rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-3">
          2. Голос: Распознавание (STT) и Синтез (TTS)
        </h2>
        
        <div className="space-y-4">
            {/* STT */}
            <div className="border p-3 rounded">
                <p className="font-medium mb-2">Распознавание речи (STT):</p>
                <input 
                    type="file" 
                    accept="audio/*" 
                    ref={audioInputRef} 
                    className="w-full text-sm mb-2"
                />
                <button
                    className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600 disabled:bg-blue-300 transition"
                    onClick={handleStt}
                    disabled={sttLoading}
                >
                    {sttLoading ? "Распознавание..." : "Распознать речь"}
                </button>
                {sttResult && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm whitespace-pre-wrap">
                        **Текст:** {sttResult}
                    </div>
                )}
            </div>

            {/* TTS */}
            <div className="border p-3 rounded">
                <p className="font-medium mb-2">Синтез речи (TTS):</p>
                <p className="text-sm text-slate-600 mb-2">На основе распознанного текста.</p>
                <button
                    className="w-full bg-green-500 text-white py-1 rounded hover:bg-green-600 disabled:bg-green-300 transition"
                    onClick={handleTts}
                    disabled={ttsLoading || !sttResult}
                >
                    {ttsLoading ? "Синтез..." : "Синтезировать голос"}
                </button>
                {audioUrl && (
                    <audio controls src={audioUrl} className="w-full mt-2"></audio>
                )}
            </div>
        </div>
      </section>


      {/* 3. Analyze Image */}
      <section className="max-w-xl w-full mx-auto p-4 bg-white shadow-lg rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-3">
          3. Анализ изображения (GPT Vision)
        </h2>

        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="w-full text-sm mb-3"
        />

        <button
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-red-300 transition"
          onClick={handleAnalyzeImage}
          disabled={analyzeLoading}
        >
          {analyzeLoading ? "Анализ..." : "Проанализировать изображение"}
        </button>

        {/* Analysis result */}
        <div className="mt-5">
          {analysisResult && (
            <div className="p-3 bg-red-50 rounded">
              <strong>Анализ изображения:</strong>
              <div className="mt-2 whitespace-pre-wrap">{analysisResult}</div>
            </div>
          )}
        </div>
      </section>
      
      {/* Инструкция - Оставим для информации, удалив ненужный старый текст */}
      <section className="max-w-3xl w-full mx-auto text-sm text-slate-600">
        <h2 className="font-medium mb-2">Инструкция (Обновлено)</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Бэкенд-функции теперь настроены на Vercel (благодаря `vercel.json`).</li>
          <li>Фронтенд отправляет файлы как **Base64**-строки (чтобы они дошли до Vercel).</li>
          <li>Для работы всех функций требуется **`OPENAI_API_KEY`** в переменных окружения Vercel.</li>
        </ol>
      </section>
    </main>
  );
}
