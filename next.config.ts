import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1").replace("localhost", "127.0.0.1")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
