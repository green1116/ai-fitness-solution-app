/** @type {import('next').NextConfig} */
const nextConfig = {
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