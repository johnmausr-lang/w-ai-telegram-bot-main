import "./globals.css";

export const metadata = {
  title: "Neon Glow AI",
  description: "Твой личный AI-компаньон с душой",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
