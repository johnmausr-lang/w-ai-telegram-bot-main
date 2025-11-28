// app/themes.js
export const themes = {
  neonPink: { name: "Neon Pulse", primary: "#ff2ea6", glow: "rgba(255,46,166,0.6)", vibe: "playful" },
  cyberBlue: { name: "Neural Blue", primary: "#00f2ff", glow: "rgba(0,242,255,0.6)", vibe: "calm" },
  violetDream: { name: "Void Kiss", primary: "#b42eff", glow: "rgba(180,46,255,0.65)", vibe: "romantic" },
  amberWarm: { name: "Sunset Soul", primary: "#ff6b2e", glow: "rgba(255,107,46,0.55)", vibe: "warm" },
  emeraldCalm: { name: "Forest Whisper", primary: "#2effa9", glow: "rgba(46,255,169,0.5)", vibe: "peaceful" },
};

export const emotionToTheme = {
  happy: "neonPink",
  soft: "violetDream",
  sad: "cyberBlue",
  angry: "amberWarm",
  calm: "emeraldCalm",
  neutral: "neonPink",
};
