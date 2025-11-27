// app/page.jsx — неоновый ИИ-компаньон с выбором персонажа
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Camera } from "lucide-react";

const ARCHETYPES = [
  {
    id: "muse_dark",
    name: "Тёмная Муза",
    vibe: "mysterious",
    description: "Поэтичная, глубокая, слегка опасная. Любит говорить намёками.",
  },
  {
    id: "stranger_bold",
    name: "Дерзкая Незнакомка",
    vibe: "playful",
    description: "Хочет играть, провоцировать и смущать тебя.",
  },
  {
    id: "soft_angel",
    name: "Нежный Ангел",
    vibe: "soft",
    description: "Тёплая, заботливая, очень мягкая.",
  },
  {
    id: "boss_secretary",
    name: "Секретарша-Испытание",
    vibe: "elegant",
    description: "Деловая, умная, слегка доминирующая.",
  },
  {
    id: "chaotic_sprite",
    name: "Хаотичная Фея",
    vibe: "wild",
    description: "Неугомонная, непредсказуемая, с огоньком.",
  },
];

const ORIENTATIONS = [
  { id: "hetero", label: "Гетеро" },
  { id: "bi", label: "Би" },
  { id: "homo", label: "Гомо" },
  { id: "fluid", label: "Флюид" },
];

export default function NeonGlowAI() {
  const [step, setStep] = useState("welcome"); // welcome | setup | chat
  const [userId, setUserId] = useState(null);
  const [loadingPersona, setLoadingPersona] = useState(true);

  const [personality, setPersonality] = useState({
    archetypeId: "muse_dark",
    archetypeName: "Тёмная Муза",
    gender: "Женщина",
    orientation: "bi",
    mode: "flirt",
    intensity: 60,
    nsfw: false,
    lookFace: "нежные черты, выразительные глаза",
    lookBody: "стройная фигура",
    lookVibe: "неоновая, мягко игривая",
  });

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Привет. Я твой неоновый ИИ-компаньон. Давай сначала настроим, кем я буду для тебя…",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingPhoto, setGeneratingPhoto] = useState(false);
  const [relationshipLevel, setRelationshipLevel] = useState(0);

  const chatRef = useRef(null);

  // Генерация/загрузка userId + персонажа
  useEffect(() => {
    let id = null;
    if (typeof window !== "undefined") {
      id = window.localStorage.getItem("neon_user_id");
      if (!id) {
        id =
          (crypto && crypto.randomUUID && crypto.randomUUID()) ||
          Math.random().toString(36).slice(2);
        window.localStorage.setItem("neon_user_id", id);
      }
    }
    setUserId(id);

    const loadPersona = async () => {
      try {
        const res = await fetch("/api/persona", {
          headers: { "x-user-id": id || "anon" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setPersonality((p) => ({
              ...p,
              ...data,
            }));
          }
        }
      } catch (e) {
        console.error("load persona error", e);
    
