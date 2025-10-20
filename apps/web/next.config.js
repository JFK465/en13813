/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Optimizes for Vercel deployment
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3001'],
    },
    // Optimize output file tracing
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        'node_modules/webpack',
        'node_modules/rollup',
        'node_modules/@rollup',
        '.git',
        '**/*.md',
        '**/*.map',
      ],
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