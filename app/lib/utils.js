// app/lib/utils.js

/**
 * Утилиты общего назначения
 */

/**
 * Форматирует дату в красивый вид: "Сегодня", "Вчера", "12 мая"
 */
export function formatChatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

/**
 * Генерирует случайный ID (для демо)
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Проверяет, содержит ли текст запрос на генерацию изображения
 */
export function isImagePrompt(text = "") {
  const triggers = [
    "фото",
    "сделай",
    "нарисуй",
    "покажи",
    "сгенерируй",
    "изображение",
    "картинку",
    "фотку",
    "photo",
    "image",
    "pic",
    "draw",
    "generate",
  ];
  return triggers.some((t) => text.toLowerCase().includes(t));
}

/**
 * Задержка (для имитации загрузки)
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Копирует текст в буфер обмена
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Делает первую букву заглавной
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
