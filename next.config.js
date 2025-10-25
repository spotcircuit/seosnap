/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude playwright-core internals from webpack bundling
      config.externals = [
        ...config.externals,
        {
          'playwright-core': 'commonjs playwright-core',
          '@sparticuz/chromium': 'commonjs @sparticuz/chromium',
        },
      ]
    }
    return config
  },
}

module.exports = nextConfig
