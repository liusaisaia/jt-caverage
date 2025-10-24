# @jt-coverage/vue3 使用指南

## 简介

@jt-coverage/vue3 是一个专为 Vue 3 项目设计的代码覆盖率工具，支持 Vite 和 webpack-chain（Vue CLI 5）构建工具。

**🎉 新版本特性：** 我们重新封装了模块，提供更清晰、更可靠的接口，同时保持完全向后兼容！

## 🚀 新封装特性

- ✅ **外部导入** - 直接导入外部的 `vite-plugin-istanbul`，避免模块解析问题
- ✅ **标准兼容** - 完全兼容 vite-plugin-istanbul 的 API
- ✅ **错误处理** - 智能的错误捕获和降级机制
- ✅ **Git 集成** - 自动获取和注入 Git 信息
- ✅ **TypeScript** - 完整的 TypeScript 类型支持
- ✅ **多框架** - 支持 Vue、Quasar 等框架
- ✅ **向后兼容** - 保持与旧版本的兼容性

## 安装

```bash
npm install @jt-coverage/vue3 vite-plugin-istanbul --save-dev
```

注意：请确保安装的vite-plugin-istanbul版本为3.x、4.x或7.x，以获得最佳兼容性。如果遇到导入问题，可以尝试指定特定版本：

```bash
# 安装v3版本（推荐）
npm install vite-plugin-istanbul@^3.0.0 --save-dev

# 或安装v4版本
npm install vite-plugin-istanbul@^4.0.0 --save-dev

# 或安装v7版本
npm install vite-plugin-istanbul@^7.0.0 --save-dev
```

## 🆕 新封装用法（推荐）

### 🎯 外部导入版本（最新优化）

**重要更新：** 我们优化了实现，直接导入外部的 `vite-plugin-istanbul`，提供更稳定、更兼容的体验！

**✨ 优势：**
- 🎯 **直接导入** - 直接 `require('vite-plugin-istanbul')`，避免复杂的模块解析
- 🔧 **零依赖冲突** - 不修改原始包结构，减少依赖冲突
- ⚡ **性能优化** - 更简洁的实现，启动更快
- 🛡️ **稳定性** - 利用 vite-plugin-istanbul 的原生功能

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { jtCoveragePlugin } from '@jt-coverage/vue3'

export default defineConfig({
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
})
```

### 标准用法（最简单）

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { jtCoveragePlugin } from '@jt-coverage/vue3'

export default defineConfig({
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
})
```

### 兼容标准 vite-plugin-istanbul

```javascript
// 与标准 vite-plugin-istanbul 完全相同的用法
import istanbul from '@jt-coverage/vue3'

export default {
  plugins: [
    vue(),
    istanbul({
      include: "src/*",
      exclude: ["node_modules"],
      extension: [".js", ".ts", ".vue"],
      requireEnv: false,
      forceBuildInstrument: true
    })
  ]
}
```

### TypeScript 项目

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { jtCoveragePlugin, CoveragePluginOptions } from '@jt-coverage/vue3'

const coverageOptions: CoveragePluginOptions = {
  include: 'src/**/*',
  exclude: ['node_modules/**', 'tests/**'],
  extension: ['.js', '.ts', '.vue'],
  requireEnv: false,
  forceBuildInstrument: true,
  coverageVariable: 'my-project'
}

export default defineConfig({
  plugins: [
    vue(),
    jtCoveragePlugin(coverageOptions)
  ]
})
```

### Quasar 框架

```javascript
// quasar.config.js
const { createQuasarHelper } = require('@jt-coverage/vue3')

const coverageHelper = createQuasarHelper({
  include: 'src/**/*',
  exclude: ['node_modules/**'],
  extension: ['.js', '.ts', '.vue']
})

module.exports = function (ctx) {
  return coverageHelper({
    // ... 其他 Quasar 配置
  })
}
```

## 📖 传统用法（仍然支持）

### Vite 配置

#### 基本用法

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

如果遇到"No 'exports' main defined"错误，这通常是由于vite-plugin-istanbul版本不兼容导致的。请尝试以下解决方案：

1. 安装特定版本：
   ```bash
   # 安装v3版本（推荐）
   npm install vite-plugin-istanbul@^3.0.0 --save-dev
   
   # 或安装v4版本
   npm install vite-plugin-istanbul@^4.0.0 --save-dev
   
   # 或安装v7版本
   npm install vite-plugin-istanbul@^7.0.0 --save-dev
   ```

2. 如果使用7.x版本，可能需要在vite.config.ts中添加以下配置：
     ```typescript
     export default defineConfig({
       // ...其他配置
       optimizeDeps: {
         exclude: ['vite-plugin-istanbul']
       }
     });
     ```

  3. 如果使用pnpm，可能需要明确指定依赖：
     ```bash
     pnpm add vite-plugin-istanbul@^3.0.0 -D
     ```

   4. 清理并重新安装依赖：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
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