export function saveChat(chat) {
  if (typeof window !== "undefined") {
    localStorage.setItem("neon_chat_history", JSON.stringify(chat));
  }
}

export function loadChat() {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("neon_chat_history");
    return raw ? JSON.parse(raw) : [];
  }
  return [];
}
