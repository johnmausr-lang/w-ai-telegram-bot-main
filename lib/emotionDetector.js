export function detectEmotion(text = "") {
  const t = text.toLowerCase();

  if (t.includes("рада") || t.includes("счаст") || t.includes("😍")) return "happy";
  if (t.includes("хоч") || t.includes("флирт") || t.includes("🔥")) return "flirty";
  if (t.includes("мм") || t.includes("ну…")) return "shy";
  if (t.includes("?") || t.includes("интерес")) return "curious";

  return "neutral";
}
