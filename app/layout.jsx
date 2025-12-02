// app/layout.jsx — ОБЯЗАТЕЛЬНО!
export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="bg-[#0A0A0E] text-white">
        {children}
      </body>
    </html>
  );
}
