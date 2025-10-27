import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,

    // Add PostHog rewrites
    async rewrites() {
        return [
            {
                source: "/ingest/static/:path*",
                destination: "https://eu-assets.i.posthog.com/static/:path*",
            },
            {
                source: "/ingest/:path*",
                destination: "https://eu.i.posthog.com/:path*",
            },
        ];
    },

    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,
    /* config options here */
};

export default nextConfig;
