/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  // Важно для работы API на Node, а не Edge
  runtime: "nodejs",
};

export default nextConfig;
