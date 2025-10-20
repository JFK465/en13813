/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3001'],
    },
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  serverRuntimeConfig: {
    maxHttpHeaderSize: 16384,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Workaround für Next.js 14.2.5 webpack chunk loading issue
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
      }
    }
    return config
  },
}

module.exports = nextConfig