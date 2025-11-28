const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
  runtime: "nodejs",
};

export default nextConfig;
