import type { NextConfig } from "next";

// Sent on every response. The CSP allows the CDNs the static pages already
// use (Bootstrap, AOS, GLightbox, three.js, Google Fonts, EmailJS) plus the
// inline <script>/<style> blocks in those pages, and blocks everything else.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
  "connect-src 'self' https://api.emailjs.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  // No includeSubDomains: mail/webmail/cpanel subdomains are served elsewhere.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
