import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['10.132.223.16', '192.168.2.22','10.43.140.16'],
  
  images: {
    qualities: [10, 75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL;
    const backendUrl = rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
      ? rawUrl.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';
    
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
