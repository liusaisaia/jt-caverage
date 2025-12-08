# @jt-coverage/vite-istanbul-tracer

专为 [vite-plugin-istanbul](https://github.com/istanbuljs/vite-plugin-istanbul) 设计的 sourcemap 偏移修正插件。当前版本：**2.0.2**

## 问题背景

使用 `vite-plugin-istanbul` 进行代码覆盖率插桩时，会在 Vite 的 transform 阶段注入 Istanbul 插桩代码，这会导致生成的 sourcemap 与实际源代码之间产生偏移，从而影响调试体验和错误追踪。

## 解决方案

本插件通过分析 vite-plugin-istanbul 的插桩模式，智能检测并修正 sourcemap 中的偏移，确保覆盖率数据与源代码位置精确对应。

## 特性

- 🎯 专为 vite-plugin-istanbul 优化
- 🔍 智能检测 Istanbul 插桩代码
- 🛠️ 支持 Vue SFC 和纯 JS 文件
- 📍 精确修正行列偏移
- ⚡ 轻量级，性能开销小
- 🔧 易于集成和配置

## 安装

```bash
npm install @jt-coverage/vite-istanbul-tracer --save-dev
```

## 使用方法

### Vite 配置

```javascript
import { defineConfig } from 'vite'
import istanbul from 'vite-plugin-istanbul'
import { createViteIstanbulTracer } from '@jt-coverage/vite-istanbul-tracer'

export default defineConfig({
  plugins: [
    istanbul({
      // vite-plugin-istanbul 配置
      include: 'src/**',
      exclude: ['node_modules', 'test/**'],
      extension: ['.js', '.ts', '.vue'],
      forceBuildInstrument: true
    }),
    // 重要：必须在 vite-plugin-istanbul 之后添加
    createViteIstanbulTracer({
      // 插件配置
      include: /\.(js|ts|vue)$/,
      exclude: /node_modules/,
      istanbulOptions: {
        instrumentCodePattern: /__cov_\w+|cov_\w+|__coverage__/,
        expectedLineOffset: 2,
        handleVueSFC: true
      }
    })
  ]
})
```

### 配置选项

```typescript
interface ViteIstanbulSourceMapTracePluginOptions {
  /**
   * 是否自动修正偏移
   * @default true
   */
  autoFix?: boolean

  /**
   * 包含的文件匹配规则
   * @default /\.(js|ts|vue)$/
   */
  include?: RegExp

  /**
   * 排除的文件匹配规则
   * @default /node_modules/
   */
  exclude?: RegExp

  /**
   * Istanbul插件特定选项
   */
  istanbulOptions?: {
    /**
     * 检测插桩代码的特征模式
     * @default /__cov_\w+|cov_\w+|__coverage__/
     */
    instrumentCodePattern?: RegExp

    /**
     * 典型的插桩代码行数偏移
     * @default 2
     */
    expectedLineOffset?: number

    /**
     * 是否处理Vue SFC文件
     * @default true
     */
    handleVueSFC?: boolean
  }
}
```

## 工作原理

1. **插桩检测**：检测代码中是否包含 Istanbul 插桩代码
2. **偏移分析**：分析 vite-plugin-istanbul 导致的行列偏移
3. **智能修正**：根据文件类型（Vue/JS）应用不同的修正策略
4. **SourceMap 更新**：更新 sourcemap 映射关系，确保位置精确

## 支持的文件类型

- ✅ JavaScript (`.js`)
- ✅ TypeScript (`.ts`)
- ✅ Vue Single File Components (`.vue`)

## 注意事项

1. **插件顺序**：必须在 `vite-plugin-istanbul` 之后添加本插件
2. **开发环境**：建议在开发环境中使用，生产环境通常不需要
3. **性能影响**：插件会对构建性能产生轻微影响，但通常在可接受范围内

## 调试

如果遇到问题，可以启用调试日志：

```javascript
createViteIstanbulTracer({
  // ...其他配置
  debug: true
})
```

## 版本更新

### 2.0.3
- 修复覆盖率错误标记在注释上的问题
- 关键优化：修改correctMappingForViteIstanbul方法，基于generatedLine而非originalLine计算偏移
- 增加更精确的Vue文件和JS/TS文件的偏移范围处理
- 优化偏移计算逻辑，确保覆盖率数据正确映射到实际代码行

### 2.0.2
- 修复了构造函数中的语法错误
- 修正了偏移计算的逻辑错误（generatedLine而非originalLine）
- 增加了向后兼容的公共方法
- 优化了文件类型检测和偏移处理策略
- 提高了在各种代码结构下的适应性

## 许可证

MIT

## 相关链接

- [vite-plugin-istanbul](https://github.com/istanbuljs/vite-plugin-istanbul)
- [Istanbul](https://istanbul.js.org/)
- [Vite](https://vitejs.dev/)
