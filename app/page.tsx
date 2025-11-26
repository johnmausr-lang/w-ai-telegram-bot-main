"use client";

import React, { useState, useRef } from "react";

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

  // Пример локального файла, который был загружен в разговоре:
  // (ты просил, чтобы я вставил этот путь — при необходимости замени)
  const UPLOADED_IMAGE_PATH = "/mnt/data/f0ce5e7a-371e-4e1c-9e9b-23408da3657b.png";

  // ====== Generate Image ======
  const handleGenerateImage = async () => {
    if (!prompt.trim()) return alert("Введите prompt для генерации изображения");

    setImageLoading(true);
    setImageUrl(null);
    try {
      const resp = await fetch("/api/image_generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size: "1024x1024" }),
      });
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      // ожидаем, что backend вернёт { data: "<base64 or url>" , isUrl: true/false }
      const json = await resp.json();
      if (json.isUrl) {
        setImageUrl(json.data);
      } else {
        // base64 data
        setImageUrl(`data:image/png;base64,${json.data}`);
      }
    } catch (e: any) {
      alert("Ошибка генерации изображения: " + (e?.message || e));
    } finally {
      setImageLoading(false);
    }
  };

  // ====== Text -> Speech ======
  const handleTextToSpeech = async () => {
    if (!prompt.trim()) return alert("Введите текст для TTS");
    setTtsLoading(true);
    setAudioUrl(null);
    try {
      const resp = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt, voice: "alloy" }),
      });
      if (!resp.ok) throw new Error("TTS failed");
      // ожидаем { isUrl: true, data: "https://..." } или { isUrl: false, data: "<base64>" }
      const json = await resp.json();
      if (json.isUrl) {
        setAudioUrl(json.data);
      } else {
        setAudioUrl("data:audio/mpeg;base64," + json.data);
      }
    } catch (e: any) {
      alert("Ошибка TTS: " + (e?.message || e));
    } finally {
      setTtsLoading(false);
    }
  };

  // ====== Speech -> Text (upload audio file) ======
  const handleSpeechToText = async (file?: File) => {
    const audioFile =
      file ?? (audioInputRef.current?.files ? audioInputRef.current.files[0] : null);
    if (!audioFile) return alert("Выберите аудиофайл для распознавания");
    setSttLoading(true);
    setSttResult(null);
    try {
      const fd = new FormData();
      fd.append("file", audioFile);
      const resp = await fetch("/api/stt", {
        method: "POST",
        body: fd,
      });
      if (!resp.ok) throw new Error("STT failed");
      const json = await resp.json();
      setSttResult(json.text ?? JSON.stringify(json));
    } catch (e: any) {
      alert("Ошибка STT: " + (e?.message || e));
    } finally {
      setSttLoading(false);
    }
  };

  // ====== Image Analyze (upload or use uploaded image path) ======
  const handleAnalyzeImage = async (useUploadedExample = false) => {
    setAnalyzeLoading(true);
    setAnalysisResult(null);
    try {
      const fd = new FormData();
      if (useUploadedExample) {
        // передаём серверу путь к заранее загруженному файлу
        // backend должен поддерживать получение JSON { path: "/mnt/..." }
        const resp = await fetch("/api/image_analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: UPLOADED_IMAGE_PATH, prompt: "Опиши изображение" }),
        });
        if (!resp.ok) throw new Error("Analyze failed");
        const json = await resp.json();
        setAnalysisResult(json.text ?? JSON.stringify(json));
      } else {
        const file = fileInputRef.current?.files ? fileInputRef.current.files[0] : null;
        if (!file) {
          alert("Выберите файл изображения для анализа");
          setAnalyzeLoading(false);
          return;
        }
        fd.append("file", file);
        fd.append("prompt", "Опиши изображение");
        const resp = await fetch("/api/image_analyze", {
          method: "POST",
          body: fd,
        });
        if (!resp.ok) throw new Error("Analyze failed");
        const json = await resp.json();
        setAnalysisResult(json.text ?? JSON.stringify(json));
      }
    } catch (e: any) {
      alert("Ошибка анализа: " + (e?.message || e));
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col gap-6">
      <section className="max-w-3xl w-full mx-auto bg-white p-6 rounded-md shadow">
        <h1 className="text-2xl font-semibold mb-4">Mini AI control panel</h1>

        <label className="block mb-2 font-medium">Prompt / Text</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full p-3 border rounded mb-3"
          placeholder="Напиши роль, реплику, описание картинки или текст для TTS..."
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerateImage}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
            disabled={imageLoading}
          >
            {imageLoading ? "Генерация..." : "Сгенерировать изображение"}
          </button>

          <button
            onClick={handleTextToSpeech}
            className="px-4 py-2 bg-green-600 text-white rounded"
            disabled={ttsLoading}
          >
            {ttsLoading ? "Генерация голоса..." : "TTS — Сгенерировать голос"}
          </button>

          <label className="px-4 py-2 bg-gray-200 rounded cursor-pointer">
            Загрузить аудио (STT)
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={() => handleSpeechToText()}
            />
          </label>

          <label className="px-4 py-2 bg-gray-200 rounded cursor-pointer">
            Загрузить изображение (анализ)
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" />
          </label>

          <button
            onClick={() => handleAnalyzeImage(false)}
            className="px-4 py-2 bg-orange-600 text-white rounded"
            disabled={analyzeLoading}
          >
            {analyzeLoading ? "Анализ..." : "Анализировать загруженное изображение"}
          </button>

          <button
            onClick={() => handleAnalyzeImage(true)}
            className="px-4 py-2 bg-amber-500 text-black rounded"
          >
            Анализировать пример (использовать загруженный в проект файл)
          </button>
        </div>

        {/* Image preview */}
        <div className="mt-5">
          {imageLoading && <div>Генерация изображения — подождите...</div>}
          {imageUrl && (
            <div className="flex flex-col gap-3">
              <img src={imageUrl} alt="Generated" className="max-w-full rounded shadow" />
              <a
                className="text-sm text-blue-600 underline"
                href={imageUrl}
                download="generated.png"
                target="_blank"
                rel="noreferrer"
              >
                Скачать изображение
              </a>
            </div>
          )}
        </div>

        {/* Audio player */}
        <div className="mt-5">
          {ttsLoading && <div>Генерация речи...</div>}
          {audioUrl && (
            <div className="flex items-center gap-4">
              <audio src={audioUrl} controls />
              <a className="text-sm text-blue-600 underline" href={audioUrl} target="_blank" rel="noreferrer">
                Открыть аудио
              </a>
            </div>
          )}
        </div>

        {/* STT result */}
        <div className="mt-5">
          {sttLoading && <div>Распознавание...</div>}
          {sttResult && (
            <div className="p-3 bg-slate-100 rounded">
              <strong>Результат STT:</strong>
              <div className="mt-2 whitespace-pre-wrap">{sttResult}</div>
            </div>
          )}
        </div>

        {/* Analysis result */}
        <div className="mt-5">
          {analyzeLoading && <div>Анализ изображения...</div>}
          {analysisResult && (
            <div className="p-3 bg-slate-100 rounded">
              <strong>Анализ изображения:</strong>
              <div className="mt-2 whitespace-pre-wrap">{analysisResult}</div>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-3xl w-full mx-auto text-sm text-slate-600">
        <h2 className="font-medium mb-2">Инструкция</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Установи API-эндпоинты `/api/tts`, `/api/stt`, `/api/image_generate`, `/api/image_analyze` в папке <code>/api</code>.</li>
          <li>Эндпоинты должны принимать JSON или FormData и возвращать JSON в формате:
            <pre className="bg-slate-50 p-2 rounded text-xs">{"{ isUrl: boolean, data: string }"}</pre>
            или для анализа: <pre className="bg-slate-50 p-2 rounded text-xs">{"{ text: string }"}</pre>
          </li>
          <li>Если хочешь использовать заранее загруженный файл на сервере — backend должен уметь принять JSON с полем <code>path</code> и прочитать файл по этому пути.</li>
        </ol>

        <div className="mt-4">
          <strong>Пример локального пути, который ты предоставил:</strong>
          <div className="mt-1 text-xs text-rose-600 break-all">{UPLOADED_IMAGE_PATH}</div>
        </div>
      </section>
    </main>
  );
}
