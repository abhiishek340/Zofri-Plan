/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' http://localhost:5000 https://*.google.com https://*.googleapis.com https://www.google-analytics.com;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 