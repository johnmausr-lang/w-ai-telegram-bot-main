// app/api/tts/route.js
import { NextResponse } from "next/server";

export const POST = async () => {
  return new Response("silence", {
    headers: { "Content-Type": "audio/mpeg" },
  });
};
