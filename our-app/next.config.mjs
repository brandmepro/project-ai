import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Capacitor compatibility
  output: 'export',
  
  // Skip OAuth callback during export (requires server-side rendering)
  // For mobile, you'll need to implement deep linking instead
  skipTrailingSlashRedirect: true,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Transpile workspace packages (all @businesspro/* must be here since they ship raw TS)
  transpilePackages: [
    '@businesspro/auth-ui',
    '@businesspro/shared-utils',
    '@businesspro/api-client',
    '@mantine/core', 
    '@mantine/hooks',
    '@mantine/form',
    '@mantine/dates',
    '@mantine/notifications'
  ],
  
  // Configure Turbopack for monorepo
  turbopack: {
    root: '..',
    resolveAlias: {
      // Force resolution to the local node_modules of the app
      '@mantine/core': './node_modules/@mantine/core',
      '@mantine/hooks': './node_modules/@mantine/hooks',
      '@mantine/form': './node_modules/@mantine/form',
      '@mantine/notifications': './node_modules/@mantine/notifications',
      'react': './node_modules/react',
      'react-dom': './node_modules/react-dom',
    },
  },
  
  // For production builds and file tracing
  outputFileTracingRoot: '..',
  
  webpack: (config) => {
    // Force webpack to resolve to the same instances
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mantine/core': path.resolve(__dirname, 'node_modules/@mantine/core'),
      '@mantine/hooks': path.resolve(__dirname, 'node_modules/@mantine/hooks'),
      '@mantine/form': path.resolve(__dirname, 'node_modules/@mantine/form'),
      '@mantine/notifications': path.resolve(__dirname, 'node_modules/@mantine/notifications'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    };
    return config;
  },
}

export default nextConfig
