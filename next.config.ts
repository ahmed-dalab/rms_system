import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Keep Node-native deps out of the server bundle (Vercel ESM/CJS issues). */
  serverExternalPackages: ["firebase-admin", "mongoose"],
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Tailwind only for app CSS — skip `next/font` internal `.module.css` files.
      "*.css": {
        condition: { path: /^app\// },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
