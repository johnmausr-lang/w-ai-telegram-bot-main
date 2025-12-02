"use client";
import { useEffect } from "react";

export default function BreathingBackground() {
  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.touches?.[0]?.clientX || e.clientX) / window.innerWidth * 100;
      const y = (e.touches?.[0]?.clientY || e.clientY) / window.innerHeight *100;
      document.body.style.setProperty('--mouse-x', `${x}%`);
      document.body.style.setProperty('--mouse-y', `${y}%`);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("touchmove", handleMove); };
  }, []);
  return null;
}
