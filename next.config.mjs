const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (!cloudName) return [];

    return {
      beforeFiles: [
        {
          source: '/uploads/users/:path*',
          destination: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/prenaxo/user/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/prenaxo/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
