const runtimeCaching = require('next-pwa/cache');
const withPWA = require("next-pwa");

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: '**',
      },
    ],
  },
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching
  },
  ...(process.env.NODE_ENV === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },
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