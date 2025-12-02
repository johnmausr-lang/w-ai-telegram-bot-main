import "./globals.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Chromatic Eclipse",
  description: "Премиальный 18+ ИИ-компаньон • 2025",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <meta name="theme-color" content="#05050A" />
      </head>
      <body className="min-h-screen bg-eclipse-bg">
        {children}
      </body>
    </html>
  );
}
