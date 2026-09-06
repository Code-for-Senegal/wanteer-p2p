import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@wantere/api-client', '@wantere/config', '@wantere/types'],
};

export default config;
