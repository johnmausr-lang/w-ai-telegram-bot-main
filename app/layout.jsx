// app/layout.jsx — ЧИСТАЯ ВЕРСИЯ (декабрь 2025)

import "./globals.css";

export const metadata = {
  title: "Neon Glow AI",
  description: "Твой 18+ цифровой спутник",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        {/* УДАЛЕНО: <link rel="manifest" href="/manifest.json" /> */}
        {/* УДАЛЕНО: favicon теперь в public/favicon.ico — подхватится сам */}
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="min-h-screen w-screen overflow-hidden bg-black text-white antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
