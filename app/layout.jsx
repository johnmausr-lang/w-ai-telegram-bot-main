export const metadata = {
  title: "Neon Glow AI",
  description: "AI Companion with Neon UI",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "black",
          color: "white",
        }}
      >
        {children}
      </body>
    </html>
  );
}
