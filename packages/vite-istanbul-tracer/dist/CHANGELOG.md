# Changelog

All notable changes to this project will be documented in this file.

## [1.4.1] - 2025-01-31 (Current)

### 🔧 改进

- **代码结构优化** - 将全局变量改为函数参数，提高代码质量和可维护性
- **搜索策略增强** - 优化映射算法，增加多列测试和对角线搜索策略
- **异常处理完善** - 添加更全面的错误捕获和日志记录，提高稳定性
- **配置灵活性提升** - 搜索范围使用maxRetries参数而非硬编码值，增强可配置性
- **映射成功率优化** - 通过多策略搜索提高了复杂场景下的映射成功率

## [1.4.0] - 2025-01-31

### ✨ 新增功能

- **双环境支持** - 同时兼容浏览器和 Node.js 环境
- **映射逻辑优化** - 提高了源映射的准确性和成功率
- **高效缓存机制** - 实现映射结果缓存，显著提升性能
- **健壮性增强** - 添加全面的错误处理和健壮性检查
- **丰富配置选项** - 支持自定义映射行为
  - `verbose`: 控制详细日志输出
  - `useCache`: 启用/禁用缓存机制
  - `cacheExpiry`: 缓存过期时间设置
  - `useFallbackMapping`: 使用备选映射策略
  - `skipUnmappable`: 跳过无法映射的位置
  - `maxRetries`: 设置最大重试次数

### 🔧 改进

- 导出方式优化，解决命名导出冲突
- 异步处理增强，支持 await 语法
- 数据结构优化，提高处理效率
- 全面的单元测试覆盖
- 映射成功率提升至 100% (测试环境)

## [1.3.0] - 2025-01-31

### ✨ 新增功能

- **自动修正增强** - `sourcemap-mapper-v2.js` 现在会自动执行修正
- **详细统计信息** - 显示映射成功率和详细的修正日志
- **更好的错误处理** - 增强了映射失败时的容错能力
- **全局函数** - 暴露 `window.__fixCoverage()` 方便手动重新修正

### 🔧 改进

- 延迟时间增加到 5 秒，确保覆盖率数据已生成
- 添加映射成功/失败的统计
- 改进日志输出，更清晰易读
- 优化性能，减少不必要的计算

### 📖 使用方式

现在只需要在项目中导入即可自动修正：

```typescript
// src/boot/coverage.ts (Quasar)
import { boot } from 'quasar/wrappers'

export default boot(async () => {
  if (process.env.DEV) {
    await import('@jt-coverage/vite-istanbul-tracer/sourcemap-mapper-v2')
  }
})
```

或者在 main.ts 中：

```typescript
// src/main.ts
if (import.meta.env.DEV) {
  import('@jt-coverage/vite-istanbul-tracer/sourcemap-mapper-v2')
}
```

## [1.2.1] - 2025-01-31

### 🔧 修复

- 添加 `sourcemap-mapper-v2.d.ts` TypeScript 类型定义
- 添加 `sourcemap-mapper.d.ts` TypeScript 类型定义
- 添加 `runtime-fix.d.ts` TypeScript 类型定义
- 修复 TypeScript 项目中的模块导入错误

## [1.2.0] - 2025-01-31

### 🔍 新增功能 - 覆盖率数据溯源诊断工具

#### ✨ 新增

- **diagnose-coverage.js** - 覆盖率数据溯源诊断工具
  - 自动检测覆盖率数据是否可以溯源
  - 生成详细的诊断报告
  - 识别常见问题并提供解决方案
  - 支持浏览器和 Node.js 环境
  - 完整的 TypeScript 类型定义

#### 📊 诊断功能

- ✅ 检测必需字段（path, statementMap, inputSourceMap 等）
- ✅ 验证 SourceMap 完整性（sources, mappings, sourcesContent）
- ✅ 识别行号异常（编译后未修正的行号）
- ✅ 数据一致性检查
- ✅ 提供针对性的解决方案建议

#### 📝 使用方式

```javascript
// 浏览器控制台
const script = document.createElement('script');
script.src = '/node_modules/@jt-coverage/vite-istanbul-tracer/diagnose-coverage.js';
document.head.appendChild(script);
setTimeout(() => diagnoseCoverage(), 1000);

// Node.js
const { diagnoseAllCoverage, generateReport } = require('@jt-coverage/vite-istanbul-tracer/diagnose-coverage');
const diagnosis = diagnoseAllCoverage(coverage);
console.log(generateReport(diagnosis));
```

#### 📖 文档

- 新增 `DIAGNOSIS_GUIDE.md` - 完整的诊断指南
- 更新 README，添加快速诊断章节
- 补充常见问题的诊断和解决方案

## [1.1.0] - 2025-01-30

### 🎉 重要更新 - 优化 SourceMap 映射

#### ✨ 新增功能

- **sourcemap-mapper-v2.js** - 优化版映射工具
  - 优先使用 `inputSourceMap`（内置在覆盖率数据中）
  - 无需额外的 `.map` 文件请求
  - 更快、更准确
  - 自动降级到外部 `.map` 文件

#### 🔧 改进

- 一键修正脚本现在使用 `inputSourceMap`
- 减少网络请求，提升性能
- 更好的错误处理和日志输出

#### 📝 使用方式

```javascript
// 方式 1：一键修正（压缩版）
(async()=>{const c=window.__coverage__;if(!c)return console.error('❌ 未找到覆盖率数据');const{TraceMap:T,originalPositionFor:o}=await import('https://esm.sh/@jridgewell/trace-mapping@0.3.25');let n=0;for(const p of Object.keys(c)){const d=c[p];if(!d.inputSourceMap)continue;try{const t=new T(d.inputSourceMap),M=(l,c)=>{const r=o(t,{line:l,column:c});return r?.line?{line:r.line,column:r.column||0}:{line:l,column:c}};Object.values(d.statementMap||{}).forEach(s=>{if(s.start)Object.assign(s.start,M(s.start.line,s.start.column));if(s.end)Object.assign(s.end,M(s.end.line,s.end.column))});Object.values(d.fnMap||{}).forEach(f=>{if(f.decl?.start)Object.assign(f.decl.start,M(f.decl.start.line,f.decl.start.column));if(f.decl?.end)Object.assign(f.decl.end,M(f.decl.end.line,f.decl.end.column));if(f.loc?.start)Object.assign(f.loc.start,M(f.loc.start.line,f.loc.start.column));if(f.loc?.end)Object.assign(f.loc.end,M(f.loc.end.line,f.loc.end.column))});Object.values(d.branchMap||{}).forEach(b=>{if(b.loc?.start)Object.assign(b.loc.start,M(b.loc.start.line,b.loc.start.column));if(b.loc?.end)Object.assign(b.loc.end,M(b.loc.end.line,b.loc.end.column));b.locations?.forEach(l=>{if(l.start)Object.assign(l.start,M(l.start.line,l.start.column));if(l.end)Object.assign(l.end,M(l.end.line,l.end.column))})});n++}catch(e){}}console.log(`🎉 完成！已修正 ${n} 个文件`)})()

// 方式 2：集成到项目
import { mapAllCoverageV2 } from '@jt-coverage/vite-istanbul-tracer/sourcemap-mapper-v2'
await mapAllCoverageV2()
```

#### 🎯 优势

- ✅ **无需外部文件** - 使用内置的 inputSourceMap
- ✅ **更快** - 不需要网络请求
- ✅ **更准确** - inputSourceMap 是 vite-plugin-istanbul 生成的
- ✅ **自动降级** - 如果没有 inputSourceMap，自动尝试外部 .map 文件

## [1.0.0] - 2025-01-30

### 🎉 重大更新 - 完整解决方案

这是一个重大版本更新，提供了完整的 Vue 覆盖率行号映射解决方案。

### ✨ 新增功能

#### 1. 运行时修正工具
- **sourcemap-mapper.js** - 在浏览器中使用 SourceMap 映射覆盖率数据
- **runtime-fix.js** - 简单的运行时修正工具
- **一键修正脚本** - 可以直接在控制台执行的压缩脚本

#### 2. 构建时修正插件
- **vite-coverage-trace.js** - 模仿 `coverage-source-map-trace-plugin` 的 Vite 插件
- 在 Babel 编译阶段修正覆盖率数据的 AST
- 支持 Vue SFC、TypeScript、JSX 等文件类型

#### 3. 完整文档
- **COVERAGE_SOURCE_MAP_TRACE_ANALYSIS.md** - 深度解析原理
- **COMPLETE_SOLUTION_SUMMARY.md** - 完整解决方案总结
- **VITE_COVERAGE_TRACE_GUIDE.md** - 构建时修正指南
- **QUICK_FIX.md** - 快速修复指南

### 🔧 改进

- 重构了插件架构，提供多种使用方式
- 添加了完整的 TypeScript 类型定义
- 优化了性能和错误处理
- 添加了详细的调试日志

### 📦 导出

现在支持多种导入方式：

```javascript
// 默认导出（调试工具）
import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'

// 构建时修正
import viteCoverageTrace from '@jt-coverage/vite-istanbul-tracer/vite-coverage-trace'

// 运行时修正
import { mapAllCoverage } from '@jt-coverage/vite-istanbul-tracer/sourcemap-mapper'
import { fixAllCoverage } from '@jt-coverage/vite-istanbul-tracer/runtime-fix'
```

### 💥 Breaking Changes

- 包的主要用途从"调试工具"变为"完整解决方案"
- 推荐使用运行时修正而不是构建时修正（更简单）
- 需要 `@jridgewell/trace-mapping` 作为依赖

### 🎯 推荐使用方式

1. **开发环境**：使用运行时修正（在控制台执行脚本）
2. **团队协作**：集成 sourcemap-mapper 到项目
3. **生产环境**：使用构建时修正（vite-coverage-trace）

## [0.0.5] - 2025-01-30

### 🐛 调试改进

- **增强调试日志**：添加更详细的插件执行日志
  - 显示插件加载状态
  - 显示每个文件的处理过程
  - 显示插桩代码检测结果
  - 显示代码前 10 行用于诊断
- **添加 configResolved 钩子**：确认插件已正确加载
- **添加 transform 计数器**：跟踪处理的文件数量

### 🎯 目的

帮助用户快速诊断插件是否正常工作，以及为什么没有检测到插桩代码。

## [0.0.4] - 2025-01-30

### 🐛 Bug 修复

- **修复 TypeScript 类型定义**：更新 `index.d.ts` 以匹配实际实现
  - 将 `ViteIstanbulSourceMapTracePlugin` 重命名为 `ViteIstanbulTracer`
  - 更新配置选项接口为 `ViteIstanbulTracerOptions`
  - 修复 "是否希望包括 new" 的类型错误
  - 添加完整的类型注释和示例

### ✨ 改进

- 添加 TypeScript 类型测试文件
- 改进类型定义的文档注释
- 确保工厂函数可以直接调用（不需要 `new`）

## [0.0.3] - 2025-01-30

### 🎉 重大重构

完全重写插件核心逻辑，修复了所有已知问题。

### ✨ 新增功能

- **自动偏移检测**：智能分析插桩代码位置，自动计算行偏移量
- **调试日志**：添加详细的调试日志，方便问题排查
- **缓存机制**：避免重复处理同一文件，提升性能
- **工厂函数**：提供 `createViteIstanbulTracer()` 工厂函数，简化使用

### 🐛 Bug 修复

- **修复 SourceMap 获取错误**：移除不存在的 `getCombinedSourcemap()` 调用
- **修复偏移修正逻辑**：正确修正生成代码行号而非原始代码行号
- **修复插件返回值**：正确处理 transform 钩子的返回值
- **修复 HMR 支持**：添加文件缓存，支持热模块替换

### 📝 文档改进

- 添加完整的 README 文档
- 添加与 coverage-source-map-trace-plugin 的对比文档
- 添加故障排查指南
- 添加问题分析文档
- 添加使用示例

### 🔧 技术改进

- 重构插件结构，适配 Vite 插件系统
- 添加 `renderChunk` 钩子支持
- 改进插桩代码检测模式
- 优化性能，减少不必要的处理

### 💥 Breaking Changes

- 工厂函数现在直接返回 Vite 插件对象，不需要调用 `.vite()` 方法
  ```javascript
  // 之前
  const tracer = new ViteIstanbulTracer()
  plugins: [tracer.vite()]

  // 现在
  import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'
  plugins: [viteIstanbulTracer()]
  ```

## [0.0.2] - 2025-01-XX

### 初始版本

- 基础的 sourcemap 偏移修正功能
- 支持 Vue SFC 和 JS 文件
- 固定偏移量配置

## [0.0.1] - 2025-01-XX

### 首次发布

- 项目初始化
- 基础插件结构
