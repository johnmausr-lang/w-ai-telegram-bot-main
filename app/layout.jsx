// app/layout.jsx
export const metadata = {
  title: "Neon Glow AI Pro",
  description: "Next-Gen AI Companion 2025",
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
          background: "black",
          color: "white",
          overflowX: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}
