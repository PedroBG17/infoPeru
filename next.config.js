/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.wp.com',
      },
      {
        protocol: 'https',
        hostname: '*.google.com',
      },
      {
        protocol: 'https',
        hostname: 'cms.dataperu.pe',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/salud',
        destination: '/hospitales',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig

