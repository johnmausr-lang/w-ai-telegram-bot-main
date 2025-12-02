const CHATS_KEY = "sleek_nocturne_chats";
const MAX_CHATS = 10;

export const saveChats = (chats) => {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats.slice(0, MAX_CHATS)));
};

export const loadChats = () => {
  const data = localStorage.getItem(CHATS_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteChat = (id) => {
  const chats = loadChats().filter(c => c.id !== id);
  saveChats(chats);
};
