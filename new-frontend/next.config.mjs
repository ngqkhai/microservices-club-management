/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Optional: Proxy API calls during development
    if (process.env.NODE_ENV === 'development' && process.env.USE_API_PROXY === 'true') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/:path*`,
        },
      ];
    }
    return [];
  },
}

export default nextConfig
