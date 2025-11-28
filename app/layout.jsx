// app/layout.jsx
export const metadata = {
  title: "Neon Glow AI Pro",
  description: "Next-Generation AI Companion 2025"
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#000",
          color: "#fff",
          maxWidth: "100vw",
          overflowX: "hidden",
          fontFamily: "-apple-system, Inter, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
