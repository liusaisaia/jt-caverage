# @jt-coverage/vue3 使用指南

## 简介

@jt-coverage/vue3 是一个专为 Vue 3 项目设计的代码覆盖率工具，支持 Vite 和 webpack-chain（Vue CLI 5）构建工具。

**🎉 新版本特性：** 现在集成了完整的 SourceMap 修正功能，实现了与 `coverage-source-map-trace-plugin` 等价的功能！

## 🚀 核心特性

- ✅ **SourceMap 完整修正** - 集成 `vite-istanbul-tracer`，修正 Vite transform 阶段的 sourcemap 偏移
- ✅ **构建时 + 运行时修正** - 双重修正机制确保精确的覆盖率定位
- ✅ **Vue SFC 特殊处理** - 专门优化 Vue 单文件组件的 sourcemap 处理
- ✅ **智能插件选择** - 自动检测并启用最合适的插件配置
- ✅ **高性能映射** - 使用 `@jridgewell/trace-mapping` 实现高性能 sourcemap 映射
- ✅ **外部导入** - 直接导入外部的 `vite-plugin-istanbul`，避免模块解析问题
- ✅ **标准兼容** - 完全兼容 vite-plugin-istanbul 的 API
- ✅ **错误处理** - 智能的错误捕获和降级机制
- ✅ **Git 集成** - 自动获取和注入 Git 信息
- ✅ **TypeScript** - 完整的 TypeScript 类型支持
- ✅ **多框架** - 支持 Vue、Quasar 等框架
- ✅ **向后兼容** - 保持与旧版本的兼容性

### 版本更新

#### 1.1.2
- 升级依赖@jt-coverage/vite-istanbul-tracer到2.0.3版本
- 修复覆盖率错误标记在注释上的问题
- 优化SourceMap映射精度，确保覆盖率数据正确映射到实际代码行

#### 1.1.1
- 优化插件加载逻辑，支持更多版本的vite-plugin-istanbul
- 增强错误处理，提供更详细的调试信息
- 修复exclude选项转换逻辑中的正则表达式转义问题

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

## 🆕 增强版用法（推荐）

### 🎯 完整功能版本（最新集成SourceMap修正）

**核心特性：** 现在集成了 `vite-istanbul-tracer` 的完整 SourceMap 修正功能，实现与 `coverage-source-map-trace-plugin` 等价的功能！

**✨ 优势：**
- 🎯 **完整SourceMap修正** - 自动修正Vite transform阶段的sourcemap偏移
- 🔧 **双重修正机制** - 构建时+运行时确保精确的覆盖率定位
- ⚡ **Vue SFC优化** - 专门处理Vue单文件组件的sourcemap
- 🛡️ **智能降级** - 如果SourceMap修正不可用，自动回退到基础版本
- 🚀 **高性能** - 使用`@jridgewell/trace-mapping`实现高性能映射

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { jtCoveragePlugin } from '@jt-coverage/vue3'

export default defineConfig({
  plugins: [
    vue(),
    jtCoveragePlugin({
      include: 'src/**/*',
      exclude: ['node_modules/**', 'tests/**'],
      extension: ['.js', '.ts', '.vue'],
      coverageVariable: 'my-vue3-project',
      debug: true, // 启用调试查看详情
      autoFix: true, // 启用SourceMap自动修正
      enableSourceMapFix: true // 明确启用增强功能
    })
  ]
})
```

### 🎯 智能模式（自动选择）

自动检测并启用SourceMap修正功能，无需手动配置：

```javascript
import { jtCoveragePlugin } from '@jt-coverage/vue3'

export default {
  plugins: [
    vue(),
    jtCoveragePlugin({
      include: 'src/**/*',
      exclude: ['node_modules/**'],
      // 智能模式：自动启用SourceMap修正
      // autoFix: true (默认值)
    })
  ]
}
```

### 🎯 增强模式（完整功能）

显式使用增强版插件，获得完整的SourceMap修正能力：

```javascript
import { createEnhancedCoveragePlugin } from '@jt-coverage/vue3'

export default {
  plugins: [
    vue(),
    // 等待插件初始化
    await createEnhancedCoveragePlugin({
      include: 'src/**/*',
      exclude: ['node_modules/**'],
      extension: ['.js', '.ts', '.vue'],
      coverageVariable: 'enhanced-vue3-project',
      debug: true,
      autoFix: true,
      enableSourceMapFix: true,
      requireSourceMapFix: true, // 强制要求SourceMap修正功能
      istanbulOptions: {
        instrumentCodePattern: /__cov_\w+|cov_\w+|__coverage__/,
        expectedLineOffset: 2,
        handleVueSFC: true
      }
    })
  ]
}
```

### 🎯 基础模式（向后兼容）

仅使用基础vite-plugin-istanbul功能，与旧版本保持兼容：

```javascript
import { createCoveragePlugin } from '@jt-coverage/vue3'

export default {
  plugins: [
    vue(),
    await createCoveragePlugin({
      include: 'src/**/*',
      exclude: ['node_modules/**'],
      extension: ['.js', '.ts', '.vue'],
      coverageVariable: 'basic-vue3-project',
      debug: false,
      autoFix: false // 明确禁用SourceMap修正
    })
  ]
}
```

## 🆕 旧封装用法（仍然支持）

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

## 🔧 SourceMap 修正功能详解

### 核心原理

新版本集成了完整的 SourceMap 修正功能，解决了 Vite `transform` 阶段插桩导致的 sourcemap 偏移问题：

**问题背景：**
- Vite 在 `transform` 阶段调用 vite-plugin-istanbul 进行代码插桩
- 插桩代码改变了原始源码的行号结构，导致 sourcemap 映射不准确
- 传统的 sourcemap 映射会指向错误的源码位置

**解决方案：**
1. **构建时修正** - 在 Vite 插件链中实时检测和修正偏移
2. **运行时修正** - 在浏览器端进行精确的映射调整
3. **Vue SFC 特殊处理** - 专门优化 Vue 单文件组件的 sourcemap 映射

### 功能对比

| 功能特性 | coverage-source-map-trace-plugin | vue3 增强版 |
|---------|--------------------------------|-------------|
| **目标平台** | Webpack + Babel | Vite + Vue3 |
| **sourcemap修正** | ✅ Loader + Babel 插件 | ✅ Vite Plugin |
| **偏移检测** | ✅ 自动检测 | ✅ 自动检测 |
| **Vue支持** | ❌ 基础支持 | ✅ 专门优化 |
| **性能优化** | ✅ 缓存机制 | ✅ @jridgewell/trace-mapping |
| **错误处理** | ✅ 基础处理 | ✅ 智能降级 |
| **配置复杂度** | 中等 | 简单（智能模式） |
| **集成难度** | 简单 | 极简单 |

### 技术实现

**双重修正机制：**

1. **构建时修正（Vite Plugin）**
```javascript
transform(code, id) {
  // 检测 vite-plugin-istanbul 插桩
  if (hasIstanbulInstrumentation(code)) {
    const sourceMap = this.getCombinedSourcemap()
    const fixedSourceMap = fixViteIstanbulOffset(sourceMap, id)
    return { code, map: fixedSourceMap }
  }
}
```

2. **运行时修正（浏览器端）**
```javascript
// 使用 @jridgewell/trace-mapping 进行高性能映射
const tracer = new TraceMap(sourceMap)
const originalPosition = originalPositionFor(tracer, line, column)
```

### 配置选项

```typescript
interface ViteCoveragePluginOptions {
  // 基础选项
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
  extension?: string[]
  coverageVariable?: string
  
  // SourceMap 修正选项
  enableSourceMapFix?: boolean  // 启用SourceMap修正
  autoFix?: boolean            // 自动修正偏移
  requireSourceMapFix?: boolean // 强制要求SourceMap修正功能
  
  // 高级选项
  istanbulOptions?: {
    instrumentCodePattern?: RegExp  // 插桩代码检测模式
    expectedLineOffset?: number     // 预期的行号偏移
    handleVueSFC?: boolean          // 是否处理Vue SFC
  }
  
  debug?: boolean  // 调试模式
}
```

### 使用建议

**开发环境推荐：**
```javascript
jtCoveragePlugin({
  include: 'src/**/*',
  exclude: ['node_modules/**', 'tests/**'],
  debug: true,           // 启用调试
  autoFix: true,         // 启用自动修正
  enableSourceMapFix: true
})
```

**生产环境推荐：**
```javascript
jtCoveragePlugin({
  include: 'src/**/*',
  exclude: ['node_modules/**'],
  debug: false,          // 关闭调试减少开销
  autoFix: true,         // 保持修正功能
  enableSourceMapFix: true
})
```

**TypeScript 项目：**
```typescript
const options: ViteCoveragePluginOptions = {
  include: 'src/**/*.{js,ts,vue}',
  exclude: ['node_modules/**', 'tests/**', '**/*.d.ts'],
  extension: ['.js', '.ts', '.vue'],
  enableSourceMapFix: true,
  istanbulOptions: {
    handleVueSFC: true,    // 专门处理Vue SFC
    expectedLineOffset: 2  // Vite typical offset
  }
}
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