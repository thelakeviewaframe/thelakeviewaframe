/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' } // allow property photos from any host while you set up; tighten later
    ]
  }
};

export default nextConfig;
