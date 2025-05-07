import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   /* config options here */
   reactStrictMode: true,
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'etletpzpbuxirovvaths.supabase.co',
            pathname: '/storage/v1/object/public/**',
         },
      ],
   },
};

export default nextConfig;
