/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, 
  async redirects() {
    return [
      {
        source: '/',
        destination: '/browse',
        permanent: false,
      },
      {
        source: '/editPost/:unused*',
        destination: '/browse',
        permanent: false,
      }
    ]
  },
}

module.exports = nextConfig;