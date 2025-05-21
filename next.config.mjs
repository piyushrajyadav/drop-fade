/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress hydration warnings from browser extensions
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // External packages configuration
  serverExternalPackages: ["redis", "cloudinary"],
  images: {
    domains: [
      'res.cloudinary.com',
    ],
  },
};

export default nextConfig; 