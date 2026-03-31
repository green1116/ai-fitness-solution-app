import type { NextConfig } from "next";

type WebpackLikeConfig = {
  watchOptions?: {
    ignored?: string | string[];
  };
};

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: ["127.0.0.1"],
  webpack: (config: WebpackLikeConfig) => {
    const existingIgnored = config.watchOptions?.ignored;

    const ignored: string[] = [];

    if (typeof existingIgnored === "string" && existingIgnored.trim()) {
      ignored.push(existingIgnored);
    } else if (Array.isArray(existingIgnored)) {
      for (const item of existingIgnored) {
        if (typeof item === "string" && item.trim()) {
          ignored.push(item);
        }
      }
    }

    ignored.push(
      "**/.git/**",
      "**/.next/**",
      "**/node_modules/**",
      "**/_regress/**"
    );

    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored,
    };

    return config;
  },
};

export default nextConfig;