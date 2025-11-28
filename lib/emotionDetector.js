// lib/emotionDetector.js
export function detectEmotion(text) {
  if (!text) return "neutral";
  const t = text.toLowerCase();

  if (t.includes("рада") || t.includes("счаст")) return "happy";
  if (t.includes("люб") || t.includes("ты мне нрав")) return "soft";
  if (t.includes("печаль") || t.includes("груст")) return "sad";
  if (t.includes("зло") || t.includes("серд")) return "angry";

  return "neutral";
}
