// lib/chatStorage.js

export function saveChat(chat) {
  if (typeof window === "undefined") return;
  localStorage.setItem("neon_chat_history", JSON.stringify(chat));
}

export function loadChat() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("neon_chat_history");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
