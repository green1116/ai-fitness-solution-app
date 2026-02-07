import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ 关键：告诉 Next/Turbopack 项目根就是当前目录
  turbopack: {
    root: path.join(__dirname),
  },

  // ✅ 额外保险：让文件追踪也以项目为根（减少诡异扫描）
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
