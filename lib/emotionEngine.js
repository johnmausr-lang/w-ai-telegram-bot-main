// lib/emotionEngine.js
export async function detectEmotionAdvanced(text) {
  if (!text.trim()) return "neutral";

  // Локальный быстрый fallback
  const quick = text.toLowerCase();
  if (quick.includes("груст") || quick.includes("плохо")) return "sad";
  if (quick.includes("злюсь") || quick.includes("бесит")) return "angry";
  if (quick.includes("люблю") || quick.includes("милый")) return "soft";
  if (quick.includes("ура") || quick.includes("круто")) return "happy";

  // AI-детекция (1 раз в 5 сообщений, чтобы не спамить)
  if (Math.random() < 0.2) {
    try {
      const res = await fetch("/api/emotion", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });
      const { emotion } = await res.json();
      return emotion || "neutral";
    } catch {
      return "neutral";
    }
  }

  return "neutral";
}
