/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable compression for better performance
  compress: true,
  // Optimize for production
  poweredByHeader: false,
  async rewrites() {
    // Proxy API calls to Kong gateway for all environments
    // Default to localhost for development, cloud URL for production
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://your-api-gateway-url.com' 
        : 'http://kong:8000');
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

export default nextConfig
