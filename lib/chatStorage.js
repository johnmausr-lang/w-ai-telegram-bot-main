export function saveChat(chat) {
  if (typeof window !== "undefined") {
    localStorage.setItem("neon_chat_history", JSON.stringify(chat));
  }
}

export function loadChat() {
  if (typeof window !== "undefined") {
    const c = localStorage.getItem("neon_chat_history");
    return c ? JSON.parse(c) : [];
  }
  return [];
}
