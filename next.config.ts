import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/ukmpr-sapari19/admin',
        destination: '/admin',
      },
    ];
  },
};

export default nextConfig;
