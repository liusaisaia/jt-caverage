/**
 * Vite 配置示例
 * 展示如何在实际项目中使用 @jt-coverage/vite-istanbul-tracer
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'

export default defineConfig({
  plugins: [
    vue(),

    // 1. 配置 vite-plugin-istanbul
    istanbul({
      include: 'src/**/*.{js,ts,vue}',
      exclude: ['node_modules', 'test/**', '**/*.spec.ts'],
      extension: ['.js', '.ts', '.vue'],
      requireEnv: false, // 开发环境也启用
      forceBuildInstrument: true,
      // 可选：自定义覆盖率变量名
      // coverageVariable: '__coverage__'
    }),

    // 2. 配置 vite-istanbul-tracer（必须在 istanbul 之后）
    viteIstanbulTracer({
      // 开启调试日志（开发时建议开启）
      debug: process.env.NODE_ENV === 'development',

      // 包含的文件类型
      include: /\.(vue|js|jsx|ts|tsx)$/,

      // 排除的文件
      exclude: /node_modules/,

      // 行偏移量（0 表示自动检测，推荐使用自动检测）
      lineOffset: 0,

      // 自定义插桩代码检测模式（通常不需要修改）
      // pattern: /var cov_\w+\s*=|function cov_\w+\(\)|__coverage__/
    })
  ],

  build: {
    // 确保生成 sourcemap
    sourcemap: true,

    // 开发环境不压缩代码，方便调试
    minify: process.env.NODE_ENV === 'production'
  },

  server: {
    port: 3000
  }
})
