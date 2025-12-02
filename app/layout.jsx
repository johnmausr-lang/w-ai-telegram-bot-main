// app/layout.jsx
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Neon Glow AI",
  description: "Твой 18+ спутник",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-[#0A0A0E] text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
