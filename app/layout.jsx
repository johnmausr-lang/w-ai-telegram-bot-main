// app/layout.jsx
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Neon Desire",
  description: "Твой личный 18+ спутник",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white font-['Inter'] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
