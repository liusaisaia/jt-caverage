# 故障排查指南

## 常见问题及解决方案

### 1. 插件没有生效

#### 症状
- 控制台没有看到 `[vite-istanbul-tracer]` 日志
- SourceMap 偏移仍然存在
- 覆盖率数据位置不准确

#### 可能原因及解决方案

##### 原因 1：插件顺序错误

```javascript
// ❌ 错误：vite-istanbul-tracer 在 istanbul 之前
export default {
  plugins: [
    viteIstanbulTracer(), // 错误位置
    istanbul()
  ]
}

// ✅ 正确：vite-istanbul-tracer 在 istanbul 之后
export default {
  plugins: [
    istanbul(),
    viteIstanbulTracer() // 正确位置
  ]
}
```

##### 原因 2：没有开启调试日志

```javascript
// 开启调试日志查看详细信息
viteIstanbulTracer({
  debug: true
})
```

##### 原因 3：文件类型不匹配

```javascript
// 检查 include 配置是否包含你的文件类型
viteIstanbulTracer({
  debug: true,
  include: /\.(vue|js|jsx|ts|tsx)$/, // 确保包含你的文件类型
  exclude: /node_modules/
})
```

##### 原因 4：没有生成 SourceMap

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true // 确保开启 sourcemap
  }
}
```

### 2. 偏移量不准确

#### 症状
- 覆盖率数据指向错误的代码行
- 断点位置不正确
- 错误堆栈行号偏移

#### 解决方案

##### 方案 1：使用自动检测（推荐）

```javascript
viteIstanbulTracer({
  lineOffset: 0 // 0 表示自动检测
})
```

##### 方案 2：手动指定偏移量

1. 查看插桩后的代码：

```javascript
// 原始代码
function hello() {
  console.log('hello')
}

// 插桩后的代码
var cov_xxx = function() { ... }();  // 第 1 行（新增）
                                      // 第 2 行（新增，空行）
function hello() {                    // 第 3 行（原第 1 行）
  cov_xxx.f[0]++;
  console.log('hello')
}
```

2. 计算偏移量：插桩代码占用了 2 行，所以偏移量是 2

3. 配置：

```javascript
viteIstanbulTracer({
  lineOffset: 2 // 手动指定偏移 2 行
})
```

##### 方案 3：检查 vite-plugin-istanbul 配置

```javascript
// 确保 vite-plugin-istanbul 配置正确
istanbul({
  include: 'src/**',
  exclude: ['node_modules', 'test/**'],
  forceBuildInstrument: true, // 确保强制插桩
  requireEnv: false // 开发环境也启用
})
```

### 3. Vue SFC 文件偏移问题

#### 症状
- `.vue` 文件的覆盖率数据位置不准确
- `<script>` 标签内的代码行号偏移

#### 解决方案

Vue SFC 文件的偏移可能更复杂，因为：
1. `<template>` 标签占用行数
2. `<script>` 标签占用行数
3. Istanbul 插桩代码占用行数

```javascript
// 示例：Vue SFC 文件
<template>           // 第 1 行
  <div>...</div>     // 第 2-5 行
</template>          // 第 6 行
                     // 第 7 行（空行）
<script>             // 第 8 行
// 插桩代码会插入到这里
export default {     // 实际代码开始
  // ...
}
</script>
```

**解决方案：**

```javascript
viteIstanbulTracer({
  debug: true, // 开启调试查看实际偏移
  lineOffset: 0 // 使用自动检测
})
```

### 4. TypeScript 文件问题

#### 症状
- `.ts` 或 `.tsx` 文件覆盖率不准确
- 类型定义影响行号

#### 解决方案

```javascript
// 确保包含 TypeScript 文件
viteIstanbulTracer({
  include: /\.(vue|js|jsx|ts|tsx)$/,
  exclude: /node_modules/
})

// 确保 vite-plugin-istanbul 也包含 TypeScript
istanbul({
  include: 'src/**/*.{js,ts,vue}',
  extension: ['.js', '.ts', '.vue']
})
```

### 5. 开发环境 vs 生产环境

#### 症状
- 开发环境正常，生产环境不正常
- 或相反

#### 解决方案

```javascript
// 根据环境配置
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [
      istanbul({
        requireEnv: false, // 不依赖环境变量
        forceBuildInstrument: isDev // 只在开发环境插桩
      }),
      viteIstanbulTracer({
        debug: isDev // 开发环境开启调试
      })
    ]
  }
})
```

### 6. HMR（热模块替换）问题

#### 症状
- 修改代码后，覆盖率数据不更新
- HMR 后偏移量变化

#### 解决方案

```javascript
// 插件会自动处理 HMR，但可以手动清除缓存
import { ViteIstanbulTracer } from '@jt-coverage/vite-istanbul-tracer'

const tracer = new ViteIstanbulTracer({ debug: true })

// 在需要时清除缓存
tracer.clearCache()

export default {
  plugins: [
    istanbul(),
    tracer.vite()
  ]
}
```

### 7. 多入口项目问题

#### 症状
- 某些入口文件偏移正确，某些不正确

#### 解决方案

```javascript
// 为不同的入口配置不同的规则
viteIstanbulTracer({
  debug: true,
  include: /\.(vue|js|jsx|ts|tsx)$/,
  exclude: /node_modules/,
  // 使用自动检测，让插件为每个文件计算偏移
  lineOffset: 0
})
```

### 8. 与其他插件冲突

#### 症状
- 添加插件后构建失败
- 其他插件不工作

#### 解决方案

检查插件顺序：

```javascript
export default {
  plugins: [
    vue(), // Vue 插件应该最先

    // 其他转换插件
    someTransformPlugin(),

    // Istanbul 插桩
    istanbul(),

    // SourceMap 修正（必须在 istanbul 之后）
    viteIstanbulTracer(),

    // 其他后处理插件
    somePostPlugin()
  ]
}
```

## 调试技巧

### 1. 查看插桩后的代码

```javascript
// 在浏览器开发者工具中查看
// 1. 打开 Sources 面板
// 2. 找到你的源文件
// 3. 查看实际加载的代码（包含插桩代码）
```

### 2. 查看 SourceMap

```javascript
// 在浏览器中查看 sourcemap
// 1. 打开 Sources 面板
// 2. 右键点击文件 -> "Reveal in sidebar"
// 3. 查看 .map 文件
```

### 3. 使用调试日志

```javascript
viteIstanbulTracer({
  debug: true // 开启详细日志
})

// 日志示例：
// [vite-istanbul-tracer] 检测到插桩代码，行偏移: 2, 文件: /src/App.vue
// [vite-istanbul-tracer] renderChunk 阶段修正 sourcemap，偏移: 2
```

### 4. 手动测试偏移

```javascript
// 创建测试文件
// test-offset.js
console.log('Line 1')
console.log('Line 2')
console.log('Line 3')

// 运行后查看覆盖率报告
// 检查行号是否正确
```

### 5. 比对原始代码和插桩代码

```bash
# 构建项目
npm run build

# 查看构建输出
cat dist/assets/your-file.js

# 对比原始文件
cat src/your-file.js
```

## 性能优化

### 1. 减少处理的文件

```javascript
viteIstanbulTracer({
  // 只处理需要覆盖率的文件
  include: /src\/.*\.(vue|js|ts)$/,
  exclude: /node_modules|test|spec/
})
```

### 2. 生产环境禁用

```javascript
export default defineConfig(({ mode }) => {
  const plugins = [vue()]

  // 只在开发环境启用覆盖率
  if (mode === 'development') {
    plugins.push(
      istanbul(),
      viteIstanbulTracer()
    )
  }

  return { plugins }
})
```

### 3. 使用缓存

```javascript
// 插件自动使用缓存，无需额外配置
// 但可以在需要时手动清除
const tracer = new ViteIstanbulTracer()
tracer.clearCache() // 清除缓存
```

## 获取帮助

如果以上方案都无法解决问题：

1. **开启调试日志**：
   ```javascript
   viteIstanbulTracer({ debug: true })
   ```

2. **收集信息**：
   - Vite 版本
   - vite-plugin-istanbul 版本
   - @jt-coverage/vite-istanbul-tracer 版本
   - 完整的 vite.config.js
   - 调试日志输出
   - 问题文件示例

3. **提交 Issue**：
   - GitHub: [提交 Issue](https://github.com/your-org/jt-coverage/issues)
   - 包含上述收集的信息

4. **社区支持**：
   - 查看已有的 Issues
   - 参考文档和示例
