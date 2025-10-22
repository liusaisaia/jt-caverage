# Vue3 覆盖率包使用说明

## 概述

`@jt-coverage/vue3` 是专为 Vue3 项目设计的代码覆盖率收集工具包，支持基于 Vue CLI 5/webpack-chain 的项目以及 Vite 项目。

## 安装

```bash
npm install @jt-coverage/vue3 --save-dev
```

如果你使用 Vite 并希望获得完整的覆盖率功能，还需要安装 `vite-plugin-istanbul`：

```bash
npm install vite-plugin-istanbul --save-dev
```

## 使用方法

### 1. Vue CLI 5 / webpack-chain 项目

```javascript
// vue.config.js
const { setupCoverageWebpack } = require('@jt-coverage/vue3');

module.exports = {
  configureWebpack: (config) => {
    return setupCoverageWebpack(config, {
      // 可选配置
      coverageVariable: 'my-project',
      applyBabel: true // 是否应用 babel-plugin-istanbul
    });
  }
};
```

### 2. Vite 项目

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vitePluginCoverage } from '@jt-coverage/vue3';

export default defineConfig({
  plugins: [
    vue(),
    vitePluginCoverage({
      // 可选配置
      coverageVariable: 'my-project',
      istanbul: {
        // vite-plugin-istanbul 配置
        include: ['src/**/*.{js,ts,vue}'],
        exclude: ['node_modules/**', 'tests/**', '**/*.spec.{js,ts}', '**/*.test.{js,ts}'],
        forceBuildInstrument: true
      }
    })
  ]
});
```

## 配置选项

### setupCoverageWebpack

- `coverageVariable`: 覆盖率变量名，用于区分不同项目的覆盖率数据
- `applyBabel`: 是否应用 babel-plugin-istanbul，默认为 true

### vitePluginCoverage

- `coverageVariable`: 覆盖率变量名，用于区分不同项目的覆盖率数据
- `istanbul`: vite-plugin-istanbul 的配置选项
  - `include`: 需要收集覆盖率的文件路径模式
  - `exclude`: 不需要收集覆盖率的文件路径模式
  - `forceBuildInstrument`: 强制在构建时启用覆盖率检测

## 组件

### CoverageButton

覆盖率显示组件，可以在你的应用中显示覆盖率信息。

```javascript
import { CoverageButton } from '@jt-coverage/vue3';

// 在组件中使用
export default {
  components: {
    CoverageButton
  }
}
```

### NativeUI

原生UI组件集合。

```javascript
import { NativeUI } from '@jt-coverage/vue3';
```

### 工具函数

- `$confirm`: 确认对话框
- `$message`: 消息提示

```javascript
import { $confirm, $message } from '@jt-coverage/vue3';

// 使用示例
$confirm('确定要执行此操作吗？').then(() => {
  // 确认后的操作
});

$message('操作成功', 'success');
```

## 注意事项

1. 如果未安装 `vite-plugin-istanbul`，Vite 插件将仅提供基本的 define 和 sourcemap 功能，不会进行覆盖率检测。

2. 覆盖率数据会在构建过程中收集，并存储在全局变量 `window.__coverage__` 中。

3. 确保在测试环境中启用覆盖率收集，在生产环境中禁用以提高性能。

## 故障排除

### 覆盖率数据为空

1. 确认已安装 `vite-plugin-istanbul`
2. 检查 `include` 和 `exclude` 配置是否正确
3. 确保源文件路径匹配配置的模式

### 构建错误

1. 检查 `vite-plugin-istanbul` 版本是否与 Vite 版本兼容
2. 尝试更新到最新版本的依赖

## 示例项目

参考项目中的 `examples` 目录，查看完整的使用示例。