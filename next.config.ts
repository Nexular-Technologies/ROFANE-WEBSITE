import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async redirects() {
    // One canonical host for search engines: www -> apex.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.rofane.co.za" }],
        destination: "https://rofane.co.za/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      // Serve the static homepage at "/" directly instead of redirecting to
      // /index.html, so the root URL is what gets indexed.
      beforeFiles: [{ source: "/", destination: "/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
