/**
 * @jt-coverage/vue3 使用示例
 * 
 * 展示如何使用重新封装的插件
 */

// 方式 1：标准用法（推荐）
const { jtCoveragePlugin } = require('@jt-coverage/vue3');

// vite.config.js
module.exports = {
  plugins: [
    vue(),
    jtCoveragePlugin({
      include: 'src/*',
      exclude: ['node_modules'],
      extension: ['.js', '.ts', '.vue'],
      requireEnv: false,
      forceBuildInstrument: true
    })
  ]
};

// 方式 2：使用别名（向后兼容）
const { createCoveragePlugin } = require('@jt-coverage/vue3');

module.exports = {
  plugins: [
    vue(),
    createCoveragePlugin({
      include: 'src/**/*',
      exclude: ['node_modules/**', 'tests/**'],
      extension: ['.js', '.ts', '.vue'],
      coverageVariable: 'my-project'
    })
  ]
};

// 方式 3：使用旧版本（如果需要）
const { vitePluginCoverage } = require('@jt-coverage/vue3/index-new');

module.exports = {
  plugins: [
    vue(),
    vitePluginCoverage({
      include: 'src/*',
      exclude: ['node_modules'],
      extension: ['.js', '.ts', '.vue']
    })
  ]
};

// 方式 4：Quasar 框架专用
const { createQuasarHelper } = require('@jt-coverage/vue3');

// quasar.config.js
const coverageHelper = createQuasarHelper({
  include: 'src/**/*',
  exclude: ['node_modules/**'],
  extension: ['.js', '.ts', '.vue']
});

module.exports = function (ctx) {
  return coverageHelper({
    // ... 其他 Quasar 配置
  });
};

// 方式 5：高级用法 - 使用工具函数
const { jtCoveragePlugin, utils } = require('@jt-coverage/vue3');

// 自定义配置
const customOptions = {
  include: 'src/**/*',
  exclude: ['node_modules/**'],
  extension: ['.js', '.ts', '.vue'],
  coverageVariable: 'custom-project'
};

// 使用工具函数预处理配置
const normalizedOptions = utils.normalizeOptions(customOptions);
const gitInfo = utils.getGitInfoSafe(customOptions);

console.log('Git 信息:', gitInfo.data);
console.log('标准化配置:', normalizedOptions);

module.exports = {
  plugins: [
    vue(),
    jtCoveragePlugin(normalizedOptions)
  ]
};

// 方式 6：TypeScript 项目（推荐）
/*
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { jtCoveragePlugin, CoveragePluginOptions } from '@jt-coverage/vue3';

const coverageOptions: CoveragePluginOptions = {
  include: 'src/**/*',
  exclude: ['node_modules/**', 'tests/**'],
  extension: ['.js', '.ts', '.vue'],
  requireEnv: false,
  forceBuildInstrument: true,
  coverageVariable: 'my-ts-project'
};

export default defineConfig({
  plugins: [
    vue(),
    jtCoveragePlugin(coverageOptions)
  ]
});
*/