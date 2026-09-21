/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep dev and production bundles isolated so concurrent commands cannot corrupt .next.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

module.exports = nextConfig;
