/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async headers() {
        return [
            {
                source: '/:path*.wasm',
                headers: [
                    { key: 'Content-Type', value: 'application/wasm' },
                ],
            },
        ];
    },
};

export default nextConfig;