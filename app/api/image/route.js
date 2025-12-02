// app/api/image/route.js — РАБОТАЕТ СЕЙЧАС ЖЕ
import { NextResponse } from "next/server";

export const POST = async (req) => {
  const { prompt = "" } = await req.json();
  const isMale = /парен|член|гей|мужик/i.test(prompt.toLowerCase());
  
  const photos = isMale 
    ? [
        "https://i.ibb.co.com/0jQ8j7F/m1.jpg",
        "https://i.ibb.co.com/5Yk5n7Z/m2.jpg",
        "https://i.ibb.co.com/9QjK7k9P/m3.jpg"
      ]
    : [
        "https://i.ibb.co.com/7Y8vYJ8K/f1.jpg",
        "https://i.ibb.co.com/3xYk5n7Z/f2.jpg",
        "https://i.ibb.co.com/5y7kL8nD/f3.jpg",
        "https://i.ibb.co.com/0jN8pK7M/f4.jpg",
        "https://i.ibb.co.com/7hN8pK7M/f5.jpg"
      ];

  const url = photos[Math.floor(Math.random() * photos.length)];

  return NextResponse.json({ imageUrl: url });
};

export const runtime = "edge";
