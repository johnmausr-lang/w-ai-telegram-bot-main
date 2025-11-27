export function detectEmotion(text) {
  text = text.toLowerCase();

  if (text.includes("рада") || text.includes("счаст")) return "happy";
  if (text.includes("мне нравится") || text.includes("мм") || text.includes("к тебе"))
    return "flirty";
  if (text.includes("ой") || text.includes("эм") || text.includes("стесня"))
    return "shy";
  if (text.includes("что") || text.includes("интерес")) return "curious";

  return "neutral";
}
