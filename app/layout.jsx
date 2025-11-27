// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "Neon Glow AI",
  description: "Персональный AI-компаньон",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-black text-white min-h-screen overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
