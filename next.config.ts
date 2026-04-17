import type { NextConfig } from "next";

/**
 * Baseline security headers applied to every response. These are the
 * dependency-free, zero-risk protections: HSTS, MIME sniffing, clickjacking,
 * referrer leakage, and broad browser-API access.
 *
 * Content-Security-Policy is intentionally NOT set here because Clerk injects
 * scripts from clerk.accounts.dev and dynamically created frame origins. A
 * misconfigured CSP silently breaks sign-in. When we're ready to enable CSP,
 * follow https://clerk.com/docs/security/clerk-csp and start in
 * `Content-Security-Policy-Report-Only` mode.
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    // 2y + includeSubDomains + preload is the hsts-preload baseline.
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
