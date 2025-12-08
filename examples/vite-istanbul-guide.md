# Vite Istanbul SourceMap Trace Plugin - 快速集成指南

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装vite-plugin-istanbul
npm install vite-plugin-istanbul --save-dev

# 安装sourcemap修正插件
npm install @jt-coverage/vite-istanbul-tracer --save-dev
```

### 2. 配置Vite

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
import { createViteIstanbulTracer } from '@jt-coverage/vite-istanbul-tracer'

export default defineConfig({
  build: {
    sourcemap: true, // 必须启用sourcemap
  },
  plugins: [
    vue(),

    // 第1步：添加istanbul插件
    istanbul({
      include: 'src/**',
      exclude: ['node_modules/**', 'test/**'],
      extension: ['.js', '.ts', '.vue'],
      forceBuildInstrument: true
    }),

    // 第2步：添加sourcemap修正插件（必须在istanbul之后）
    createViteIstanbulTracer({
      autoFix: true,
      istanbulOptions: {
        expectedLineOffset: 2,
        handleVueSFC: true
      }
    })
  ]
})
```

## 📋 配置详解

### 基本配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `autoFix` | boolean | true | 自动修正检测到的偏移 |
| `include` | RegExp | /\\.(js\|ts\|vue)$/ | 包含的文件类型 |
| `exclude` | RegExp | /node_modules/ | 排除的目录 |

### Istanbul选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `instrumentCodePattern` | RegExp | /__cov_\\w+\|cov_\\w+\|__coverage__/ | 插桩代码检测模式 |
| `expectedLineOffset` | number | 2 | 期望的行偏移量 |
| `handleVueSFC` | boolean | true | 是否处理Vue单文件组件 |

## 🔧 高级配置

### 调试模式

```javascript
createViteIstanbulTracer({
  autoFix: true,
  debug: true, // 启用调试日志
  istanbulOptions: {
    instrumentCodePattern: /__cov_\w+|cov_\w+|__coverage__/,
    expectedLineOffset: 2,
    handleVueSFC: true
  }
})
```

### 自定义文件匹配

```javascript
createViteIstanbulTracer({
  include: /\.(js|ts|jsx|tsx|vue|svelte)$/, // 支持更多文件类型
  exclude: /(node_modules|\.test\.|\.spec\.)/, // 排除测试文件
  autoFix: true,
  istanbulOptions: {
    expectedLineOffset: 3, // 根据实际偏移调整
    handleVueSFC: true
  }
})
```

## ✅ 验证集成

### 1. 检查构建输出

运行构建命令后，检查控制台输出：

```bash
npm run build
```

应该看到类似输出：
```
[ViteIstanbulSourceMapTrace] 检测到插桩代码: src/components/Button.vue
[ViteIstanbulSourceMapTrace] 修正Vue文件偏移: Button.vue
```

### 2. 验证SourceMap

使用Chrome开发者工具：
1. 打开Sources面板
2. 找到你的源代码文件
3. 设置断点
4. 验证断点位置是否正确

### 3. 检查覆盖率报告

运行测试并检查覆盖率报告：
```bash
npm run test:coverage
```

覆盖率数据应该准确对应源代码位置。

## 🐛 常见问题

### Q1: 插件顺序错误
**问题**: `Error: Plugin must be added after vite-plugin-istanbul`

**解决**: 确保插件顺序正确：
```javascript
plugins: [
  istanbul({...}),      // 先添加
  sourceMapTrace({...}) // 后添加
]
```

### Q2: SourceMap未生成
**问题**: 插件报告找不到sourcemap

**解决**: 确保Vite配置中启用sourcemap：
```javascript
build: {
  sourcemap: true
}
```

### Q3: 偏移修正不准确
**问题**: 修正后的位置仍然不准确

**解决**: 调整`expectedLineOffset`：
```javascript
istanbulOptions: {
  expectedLineOffset: 3, // 尝试增加或减少
  handleVueSFC: true
}
```

## 📚 相关链接

- [vite-plugin-istanbul](https://github.com/istanbuljs/vite-plugin-istanbul)
- [Vite文档](https://vitejs.dev/config/)
- [Istanbul文档](https://istanbul.js.org/)

## 📄 完整示例

参考项目中的完整配置示例：
- `examples/vite-istanbul-integration-example.js`

## 🎯 下一步

1. 根据项目需求调整配置
2. 运行测试验证覆盖率准确性
3. 集成到CI/CD流程中
