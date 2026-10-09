/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF first, WebP as the fallback; the original JPEG is never sent to a modern browser.
    formats: ["image/avif", "image/webp"]
    // Every image is served from /public, so there are no remote hosts to allow.
    // If one is ever added, list it here (an unlisted host fails the build on purpose):
    // remotePatterns: [{ protocol: "https", hostname: "cdn.example.com" }]
  }
};

export default nextConfig;
