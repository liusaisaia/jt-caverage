# @jt-coverage/vue3 使用指南

## 简介

@jt-coverage/vue3 是一个专为 Vue 3 项目设计的代码覆盖率工具，支持 Vite 和 webpack-chain（Vue CLI 5）构建工具。

## 安装

```bash
npm install @jt-coverage/vue3 vite-plugin-istanbul --save-dev
```

## Vite 配置

### 基本用法

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { vitePluginCoverage } from '@jt-coverage/vue3';

export default defineConfig({
  plugins: [
    vitePluginCoverage({
      istanbul: {
        include: ['src/**/*.{js,ts,vue}'],
        exclude: ['node_modules/**', 'tests/**'],
        forceBuildInstrument: true
      },
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/**',
          'tests/**',
          '**/*.spec.{js,ts}',
          '**/*.test.{js,ts}'
        ]
      }
    })
  ]
});
```

### 与 Vitest 集成

```javascript
// vite.config.js
import { defineConfig } from 'vitest/config';
import { vitePluginCoverage } from '@jt-coverage/vue3';

export default defineConfig({
  plugins: [
    vitePluginCoverage({
      istanbul: {
        include: ['src/**/*.{js,ts,vue}'],
        exclude: ['node_modules/**', 'tests/**'],
        forceBuildInstrument: true
      }
    })
  ],
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.spec.{js,ts}',
        '**/*.test.{js,ts}'
      ]
    }
  }
});
```

## webpack-chain（Vue CLI 5）配置

```javascript
// vue.config.js
const { setupCoverageWebpack } = require('@jt-coverage/vue3');

module.exports = {
  configureWebpack: (config) => {
    return setupCoverageWebpack(config, {
      coverageVariable: 'my-project'
    });
  }
};
```

## 运行测试并生成覆盖率报告

```bash
# 使用 Vitest
npx vitest run --coverage

# 使用 Jest
npx jest --coverage
```

## 配置选项

### vitePluginCoverage 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| istanbul | object | 见下文 | vite-plugin-istanbul 的配置选项 |
| coverage | object | 见下文 | 覆盖率报告的配置选项 |

### istanbul 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| include | array | ['src/**/*.{js,ts,vue}'] | 包含的文件模式 |
| exclude | array | ['node_modules/**', 'tests/**', '**/*.spec.{js,ts}', '**/*.test.{js,ts}'] | 排除的文件模式 |
| forceBuildInstrument | boolean | true | 强制在构建时插桩 |

### coverage 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| provider | string | 'istanbul' | 覆盖率提供者 |
| reporter | array | ['text', 'json', 'html'] | 报告格式 |
| exclude | array | 见上表 | 排除的文件模式 |

## 故障排除

### 1. 插件未找到错误

确保已安装 vite-plugin-istanbul：

```bash
npm install vite-plugin-istanbul --save-dev
```

### 2. 覆盖率数据不准确

检查以下配置：
- 确保 `forceBuildInstrument: true`
- 确保包含所有需要收集覆盖率的文件
- 确保测试环境配置正确

### 3. 覆盖率报告未生成

确保运行测试时添加了 `--coverage` 参数：

```bash
npx vitest run --coverage
```

## 示例项目

查看 `examples/` 目录中的示例项目，了解如何在不同场景下使用 @jt-coverage/vue3。