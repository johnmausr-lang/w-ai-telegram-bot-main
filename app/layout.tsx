import "./globals.css";

export const metadata = {
  title: "AI Mini App",
  description: "Telegram + Web AI App"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
