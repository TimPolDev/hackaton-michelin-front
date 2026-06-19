import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/gamme-michelin',
        destination: '/tires',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1").replace("localhost", "127.0.0.1")}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'viwlkozcralohiitwqdp.supabase.co',
      },
    ],
  },
};

export default nextConfig;
