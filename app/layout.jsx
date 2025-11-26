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
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen w-screen overflow-hidden bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
