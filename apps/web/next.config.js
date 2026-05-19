/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['shared-ui', 'wallet-core', 'biometric-core', 'utils'],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};

module.exports = nextConfig;
