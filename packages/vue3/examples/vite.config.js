import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vitePluginCoverage } from '@jt-coverage/vue3';
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
  plugins: [
    vue(),
    vitePluginCoverage({
      // 覆盖率变量名，用于区分不同项目的覆盖率数据
      coverageVariable: 'my-vue3-project',
      // vite-plugin-istanbul 配置
      istanbul: {
        // 需要收集覆盖率的文件路径模式
        include: ['src/**/*.{js,ts,vue}'],
        // 不需要收集覆盖率的文件路径模式
        exclude: [
          'node_modules/**', 
          'tests/**', 
          '**/*.spec.{js,ts}', 
          '**/*.test.{js,ts}'
        ],
        // 强制在构建时启用覆盖率检测
        forceBuildInstrument: true
      }
    }),
    // 直接添加istanbul插件作为备用
    istanbul({
      include: ['src/**/*.{js,ts,vue}'],
      exclude: [
        'node_modules/**', 
        'tests/**', 
        '**/*.spec.{js,ts}', 
        '**/*.test.{js,ts}'
      ],
      forceBuildInstrument: true
    })
  ],
  // 其他 Vite 配置...
});