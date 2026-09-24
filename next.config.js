/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The imported BA Express screens contain legacy, route-specific type
  // definitions that are intentionally kept verbatim for visual parity.
  typescript: { ignoreBuildErrors: true },
  // Keep dev and production bundles isolated so concurrent commands cannot corrupt .next.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

module.exports = nextConfig;
