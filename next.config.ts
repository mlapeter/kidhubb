import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Requests to play.kidhubb.com/render/[slug] are rewritten to the API route
        {
          source: "/render/:slug",
          has: [{ type: "host", value: "play.kidhubb.com" }],
          destination: "/api/render/:slug",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
