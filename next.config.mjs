const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: '/api/cart/:path*',
				headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
			},
			{
				source: '/api/wishlist/:path*',
				headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
			},
			{
				source: '/api/profile/:path*',
				headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
			},
			{
				source: '/api/account/:path*',
				headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
			},
			{
				source: '/api/orders/:path*',
				headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
			},
			{
				source: '/api/cart/coupon',
				headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
			},
			{
				source: '/api/payment-methods',
				headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
			},
			{
				source: '/api/auth/:path*',
				headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
			},
			{
				source: '/api/admin/:path*',
				headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
			},
		];
	},
	async rewrites() {
		if (!cloudName) return [];

		return {
			fallback: [
				{
					source: '/uploads/users/:path*',
					destination: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/prenaxo/user/:path*`,
				},
				{
					source: '/uploads/:path*',
					destination: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/:path*`,
				},
			],
		};
	},
};

export default nextConfig;
