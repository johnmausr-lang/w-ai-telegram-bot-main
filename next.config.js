/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  }
  // runtime: "nodejs" ← УДАЛИ ЭТУ СТРОКУ!
};

export default nextConfig;
