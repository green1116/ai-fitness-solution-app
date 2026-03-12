/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {}, // 企业级：明确声明，避免 next16 在 CI 报错
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: [
        "**/node_modules/**",
        "C:\\\\swapfile.sys",
        "C:\\\\pagefile.sys",
        "C:\\\\hiberfil.sys",
        "C:\\\\System Volume Information/**",
        "C:\\\\$Recycle.Bin/**",
      ],
    };
    return config;
  },
};

module.exports = nextConfig;