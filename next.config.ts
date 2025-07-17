import type { NextConfig } from "next";
// 直接使用require导入webpack，避免TypeScript错误
// @ts-ignore
const webpack = require('webpack');

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // 解决pptxgenjs的Node.js模块问题
    if (!isServer) {
      // 处理常规Node.js模块
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        path: false,
        process: false,
        Buffer: false,
      };

      // 使用NormalModuleReplacementPlugin来处理"node:"前缀的导入
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:/,
          (resource: any) => {
            const mod = resource.request.replace(/^node:/, '');
            resource.request = mod;
          }
        )
      );
    }
    return config;
  },
};

export default nextConfig;
