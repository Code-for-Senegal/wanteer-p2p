import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@p2p-local/api-client', '@p2p-local/config', '@p2p-local/types'],
};

export default config;
