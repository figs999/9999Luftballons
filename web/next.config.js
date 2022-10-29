const runtimeCaching = require('next-pwa/cache');
const withPWA = require("next-pwa");

module.exports = withPWA({
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  pwa: {
    dest: 'public',
    disable: true,
    runtimeCaching
  },
  ...(process.env.NODE_ENV === 'production' && {
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
});

/*
module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      '*.googleusercontent.com',
      'googleusercontent.com:*',
      '*.googleusercontent.com:*',
      'openseauserdata.com:*',
      'openseauserdata.com'
    ]
  }
}
*/