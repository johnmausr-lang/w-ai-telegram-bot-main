// app/api/persona/route.js
import { kv } from "@vercel/kv";

const headersJson = {
  "Content-Type": "application/json; charset=utf-8",
};

function getUserId(req) {
  return req.headers.get("x-user-id") || "anon";
}

// Сохранение персонажа
export const POST = async (req) => {
  try {
    const userId = getUserId(req);
    const body = await req.json();

    const persona = body.personality || body.persona || body;

    if (!persona) {
      return new Response(
        JSON.stringify({ error: "Нет данных персонажа" }),
        { status: 400, headers: headersJson }
      );
    }

    await kv.set(`persona:${userId}`, persona);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: headersJson }
    );
  } catch (e) {
    console.error("Persona POST error", e);
    return new Response(
      JSON.stringify({ error: "Ошибка сохранения персонажа" }),
      { status: 500, headers: headersJson }
    );
  }
};

// Загрузка персонажа
export const GET = async (req) => {
  try {
    const userId = getUserId(req);
    const persona = await kv.get(`persona:${userId}`);

    return new Response(
      JSON.stringify(persona || null),
      { status: 200, headers: headersJson }
    );
  } catch (e) {
    console.error("Persona GET error", e);
    return new Response(
      JSON.stringify({ error: "Ошибка загрузки персонажа" }),
      { status: 500, headers: headersJson }
    );
  }
};
