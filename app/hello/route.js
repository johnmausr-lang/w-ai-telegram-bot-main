export function GET() {
  return new Response(
    JSON.stringify({ status: "ok", service: "NeonGlowAI" }),
    { headers: { "Content-Type": "application/json" } }
  );
}
