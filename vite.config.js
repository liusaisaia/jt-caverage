import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  build: {
    minify: false, // 禁止代码压缩和混淆，方便调试
    sourcemap: true, // 生成 source map 文件，提供更好的调试体验
    lib: {
      entry: 'index.js', // 将 index.js 作为唯一的入口文件
      name: 'JtCoverage', // 为你的库提供一个全局变量名（主要用于 UMD 格式）
      formats: ['cjs'],
      // 生成单一的输出文件，例如 dist/jt-coverage.cjs.js
      fileName: (format) => `jt-coverage.${format}.js`
    },
    cssCodeSplit: true,  // 确保CSS代码被分离处理
    rollupOptions: {
      // 将不需要打包进库的依赖外部化
      external: ['vue', 'dayjs', 'path', 'child_process', 'coverage-source-map-trace-plugin'],
      output: {
        globals: {
          vue: 'Vue'
        },
        assetFileNames: 'assets/[name].[ext]'  // 确保样式文件正确输出
      }
    }
  },
  plugins: [vue()]
})
