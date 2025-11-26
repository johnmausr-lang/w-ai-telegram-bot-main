import "./globals.css";

export const metadata = {
  title: "Neon Glow AI",
  description: "Твой идеальный цифровой спутник",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="h-screen w-screen overflow-hidden">{children}</body>
    </html>
  );
}
