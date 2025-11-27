// Файл: layout.jsx
import "./globals.css";

export const metadata = {
  title: "Neon Glow AI",
  description: "Твой 18+ цифровой спутник",
};

// Использование 'dvh' для корректной работы на мобильных устройствах/Telegram
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
        <meta name="theme-color" content="#000000" />
        {/* Добавляем скрипт Telegram WebApp */}
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <link rel="manifest" href="/manifest.json" />
      </head>
      {/* ИСПРАВЛЕНИЕ: min-h-dvh для корректной высоты на мобильных */}
      <body className="min-h-dvh w-screen overflow-hidden bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
