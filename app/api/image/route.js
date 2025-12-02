// app/api/image/route.js — ФИНАЛЬНЫЙ, НЕУБИВАЕМЫЙ ВАРИАНТ (ДЕКАБРЬ 2025)
import { NextResponse } from "next/server";

// Фото лежат на GitHub — НЕ УДАЛЯЮТСЯ, НЕ БЛОКИРУЮТСЯ, ГРУЗЯТСЯ МОМЕНТАЛЬНО
const PHOTOS = [
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/f1.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/f2.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/f3.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/f4.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/f5.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/f6.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/f7.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/f8.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/m1.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/m2.jpg",
  "https://raw.githubusercontent.com/anon-ru-images/18plus/main/m3.jpg"
];

export const POST = async (request) => {
  try {
    const { prompt = "" } = await request.json();

    // Определяем, мужские или женские фото нужны
    const isMale = /парен|член|гей|мужик|парня|хуй/i.test(prompt.toLowerCase());

    const malePhotos = PHOTOS.filter(p => p.includes("/m"));
    const femalePhotos = PHOTOS.filter(p => p.includes("/f"));

    const pool = isMale && malePhotos.length > 0 ? malePhotos : femalePhotos;
    const randomPhoto = pool[Math.floor(Math.random() * pool.length)];

    return NextResponse.json({ 
      imageUrl: randomPhoto + "?t=" + Date.now() 
    });

  } catch (error) {
    // На любой случай — всегда возвращаем фото
    const fallback = PHOTOS[Math.floor(Math.random() * PHOTOS.length)];
    return NextResponse.json({ 
      imageUrl: fallback 
    });
  }
};

// Обязательно для Vercel
export const runtime = "edge";
export const dynamic = "force-dynamic";
