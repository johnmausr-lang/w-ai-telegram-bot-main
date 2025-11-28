import "./globals.css";

export const metadata = {
  title: "Neon Glow AI Pro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-black text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
