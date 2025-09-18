import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      // Handle app subdomain routes
      {
        source: '/app/:path*',
        destination: '/app/:path*',
      },
    ];
  },
};

export default nextConfig;
