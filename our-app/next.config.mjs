import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Transpile workspace packages
  transpilePackages: ['@businesspro/auth-ui'],
  
  // Configure Turbopack for monorepo
  turbopack: {
    // Point to monorepo root where dependencies are installed
    root: path.join(__dirname, '..'),
  },
  
  // For production builds and file tracing
  outputFileTracingRoot: path.join(__dirname, '..'),
}

export default nextConfig
