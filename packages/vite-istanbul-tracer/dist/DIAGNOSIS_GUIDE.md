# 覆盖率数据溯源诊断指南

## 什么是"无法溯源"？

在使用 `vite-plugin-istanbul` 进行代码覆盖率收集时，覆盖率数据记录的是**编译后代码**的行号，而我们需要的是**原始源码**的行号。这个转换过程称为"溯源"，需要依赖 SourceMap。

如果覆盖率数据"无法溯源"，会导致：
- ❌ 覆盖率界面显示的行号与源码不匹配
- ❌ 注释行被标记为已覆盖
- ❌ 实际执行的代码行显示为未覆盖
- ❌ 调试困难，断点位置不准确

## 快速诊断

### 步骤 1：在浏览器控制台运行诊断

```javascript
// 加载诊断工具
const script = document.createElement('script');
script.src = '/node_modules/@jt-coverage/vite-istanbul-tracer/diagnose-coverage.js';
document.head.appendChild(script);

// 等待加载完成后执行（约 1 秒）
setTimeout(() => {
  diagnoseCoverage();
}, 1000);
```

### 步骤 2：查看诊断报告

诊断工具会输出详细的报告：

```
================================================================================
覆盖率数据溯源诊断报告
================================================================================

📊 总体摘要:
  总文件数: 5
  ✅ 可溯源: 3
  ❌ 无法溯源: 2
  ⚠️  有问题: 2
  ⚡ 有警告: 1

📋 详细结果:

✅ /src/components/Button.vue
   语句数: 15
   SourceMap: 有

❌ /src/utils/helper.js
   语句数: 8
   SourceMap: 无
   ❌ 问题:
      - 缺少 inputSourceMap，无法进行源码映射

⚠️ /src/views/Home.vue
   语句数: 42
   SourceMap: 有
   ⚠️  警告:
      - 行号异常大 (15234)，可能是编译后未修正的行号

💡 建议:
  1. 检查 vite-plugin-istanbul 配置，确保 forceBuildInstrument 为 true
  2. 确认 Vite 配置中 build.sourcemap 为 true
  3. 使用 vite-istanbul-tracer 插件修正行号映射
  4. 检查 Vue 文件是否正确编译并生成了 SourceMap
```

## 常见问题及解决方案

### 问题 1：缺少 inputSourceMap

**症状：**
```
❌ 问题:
   - 缺少 inputSourceMap，无法进行源码映射
```

**原因：**
- Vite 没有生成 SourceMap
- vite-plugin-istanbul 配置不正确

**解决方案：**

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true  // ✅ 确保生成 sourcemap
  },
  plugins: [
    istanbul({
      include: 'src/**',
      forceBuildInstrument: true  // ✅ 强制插桩
    })
  ]
}
```

### 问题 2：inputSourceMap.sources 为空

**症状：**
```
❌ 问题:
   - inputSourceMap.sources 为空
```

**原因：**
- SourceMap 生成不完整
- Vue 文件编译出错

**解决方案：**

1. 检查 Vue 插件配置：
```javascript
// vite.config.js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      // 确保 Vue 插件正确配置
    }),
    istanbul({
      include: 'src/**/*.{js,ts,vue}',
      extension: ['.js', '.ts', '.vue']
    })
  ]
}
```

2. 检查文件是否有语法错误

### 问题 3：行号异常大

**症状：**
```
⚠️  警告:
   - 行号异常大 (15234)，可能是编译后未修正的行号
```

**原因：**
- Vue SFC 编译后，`<script>` 部分的代码被移到了很后面
- 行号没有通过 SourceMap 映射回原始位置

**解决方案：**

使用本插件的运行时修正或构建时修正：

**方案 A：运行时修正（推荐）**
```javascript
// 在浏览器控制台执行一键修正脚本
(async()=>{const c=window.__coverage__;if(!c)return console.error('❌ 未找到覆盖率数据');const{TraceMap:T,originalPositionFor:o}=await import('https://esm.sh/@jridgewell/trace-mapping@0.3.25');let n=0;for(const p of Object.keys(c)){const d=c[p];if(!d.inputSourceMap)continue;try{const t=new T(d.inputSourceMap),M=(l,c)=>{const r=o(t,{line:l,column:c});return r?.line?{line:r.line,column:r.column||0}:{line:l,column:c}};Object.values(d.statementMap||{}).forEach(s=>{if(s.start)Object.assign(s.start,M(s.start.line,s.start.column));if(s.end)Object.assign(s.end,M(s.end.line,s.end.column))});Object.values(d.fnMap||{}).forEach(f=>{if(f.decl?.start)Object.assign(f.decl.start,M(f.decl.start.line,f.decl.start.column));if(f.decl?.end)Object.assign(f.decl.end,M(f.decl.end.line,f.decl.end.column));if(f.loc?.start)Object.assign(f.loc.start,M(f.loc.start.line,f.loc.start.column));if(f.loc?.end)Object.assign(f.loc.end,M(f.loc.end.line,f.loc.end.column))});Object.values(d.branchMap||{}).forEach(b=>{if(b.loc?.start)Object.assign(b.loc.start,M(b.loc.start.line,b.loc.start.column));if(b.loc?.end)Object.assign(b.loc.end,M(b.loc.end.line,b.loc.end.column));b.locations?.forEach(l=>{if(l.start)Object.assign(l.start,M(l.start.line,l.start.column));if(l.end)Object.assign(l.end,M(l.end.line,l.end.column))})});n++}catch(e){}}console.log(`🎉 完成！已修正 ${n} 个文件`)})()
```

**方案 B：构建时修正**
```javascript
// vite.config.js
import viteCoverageTrace from '@jt-coverage/vite-istanbul-tracer/vite-coverage-trace'

export default {
  plugins: [
    istanbul(),
    viteCoverageTrace({
      debug: true
    })
  ]
}
```

### 问题 4：sourcesContent 为空

**症状：**
```
⚠️  警告:
   - inputSourceMap.sourcesContent 为空，可能需要加载外部 .map 文件
```

**原因：**
- SourceMap 没有内联源码内容
- 需要从外部 .map 文件加载

**解决方案：**

这通常不影响溯源，但如果需要源码内容，可以：

```javascript
// 手动加载 .map 文件
async function loadSourceMap(filePath) {
  const mapPath = filePath + '.map';
  const response = await fetch(mapPath);
  const sourceMap = await response.json();
  return sourceMap;
}
```

## 诊断工具 API

### 浏览器环境

```javascript
// 全局函数
window.diagnoseCoverage()

// 返回值
{
  success: true,
  summary: {
    total: 5,
    canTrace: 3,
    cannotTrace: 2,
    hasIssues: 2,
    hasWarnings: 1
  },
  results: {
    '/src/App.vue': {
      canTrace: true,
      issues: [],
      warnings: [],
      filePath: '/src/App.vue',
      hasSourceMap: true,
      statementCount: 15
    },
    // ...
  }
}
```

### Node.js 环境

```javascript
const {
  diagnoseCoverageData,      // 诊断单个文件
  diagnoseAllCoverage,       // 诊断所有文件
  generateReport             // 生成格式化报告
} = require('@jt-coverage/vite-istanbul-tracer/diagnose-coverage');

// 诊断单个文件
const fileCoverage = coverage['/src/App.vue'];
const result = diagnoseCoverageData(fileCoverage, '/src/App.vue');

if (!result.canTrace) {
  console.log('无法溯源的原因：');
  result.issues.forEach(issue => console.log(`  - ${issue}`));
}

// 诊断所有文件
const diagnosis = diagnoseAllCoverage(coverage);
console.log(generateReport(diagnosis));
```

## 判断标准

诊断工具根据以下标准判断是否可以溯源：

### ✅ 可以溯源的条件

1. 存在 `inputSourceMap` 字段
2. `inputSourceMap.sources` 不为空
3. `inputSourceMap.mappings` 不为空
4. 行号在合理范围内（1 到 10000）
5. 数据结构完整（包含 path, statementMap, fnMap, branchMap 等）

### ❌ 无法溯源的情况

1. 缺少 `inputSourceMap`
2. `inputSourceMap.sources` 为空
3. `inputSourceMap.mappings` 为空
4. 行号无效（< 1）
5. 缺少必需字段

### ⚠️ 需要注意的情况

1. `sourcesContent` 为空（不影响溯源，但可能需要外部文件）
2. 行号异常大（> 10000，可能是编译后未修正）
3. 路径包含查询参数（可能影响文件匹配）
4. 语句计数与映射数量不匹配（数据可能不一致）

## 完整诊断流程

```
1. 运行应用，触发代码执行
   ↓
2. 打开浏览器控制台
   ↓
3. 加载诊断工具
   ↓
4. 运行 diagnoseCoverage()
   ↓
5. 查看诊断报告
   ↓
6. 根据问题类型选择解决方案：
   - 缺少 SourceMap → 配置 Vite
   - 行号偏移 → 使用修正工具
   - 数据不完整 → 检查插桩配置
   ↓
7. 应用解决方案
   ↓
8. 重新诊断验证
   ↓
9. ✅ 所有文件可溯源
```

## 最佳实践

1. **开发环境配置**
   ```javascript
   // vite.config.js
   export default {
     build: {
       sourcemap: true
     },
     plugins: [
       vue(),
       istanbul({
         include: 'src/**',
         exclude: ['node_modules', 'test/**'],
         extension: ['.js', '.ts', '.vue'],
         requireEnv: false,
         forceBuildInstrument: true
       }),
       viteIstanbulTracer({
         debug: true
       })
     ]
   }
   ```

2. **定期诊断**
   - 在开发过程中定期运行诊断
   - 在 CI/CD 中集成诊断检查
   - 发现问题及时修复

3. **使用运行时修正**
   - 开发环境使用运行时修正，快速验证
   - 生产环境使用构建时修正，一劳永逸

4. **保持工具更新**
   ```bash
   npm update @jt-coverage/vite-istanbul-tracer
   ```

## 相关资源

- [vite-plugin-istanbul 文档](https://github.com/istanbuljs/vite-plugin-istanbul)
- [SourceMap 规范](https://sourcemaps.info/spec.html)
- [Istanbul 覆盖率格式](https://github.com/istanbuljs/istanbuljs/blob/master/packages/istanbul-lib-coverage/lib/file-coverage.js)
