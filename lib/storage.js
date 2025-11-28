// lib/storage.js
export function saveData(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem("neon_glow_2025", JSON.stringify(data));
}

export function loadData() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("neon_glow_2025");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
