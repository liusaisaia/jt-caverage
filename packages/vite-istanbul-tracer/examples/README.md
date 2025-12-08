# 使用示例

本目录包含 `@jt-coverage/vite-istanbul-tracer` 的使用示例。

## 示例列表

### 1. 基础配置示例

文件：`vite.config.example.js`

展示最基本的配置方式，适合快速上手。

```bash
# 复制配置文件
cp examples/vite.config.example.js vite.config.js

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. Vue 3 + TypeScript 示例

适用于 Vue 3 + TypeScript 项目。

```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'

export default defineConfig({
  plugins: [
    vue(),
    istanbul({
      include: 'src/**/*.{ts,tsx,vue}',
      exclude: ['node_modules', '**/*.spec.ts'],
      extension: ['.ts', '.tsx', '.vue'],
      requireEnv: false,
      forceBuildInstrument: true
    }),
    viteIstanbulTracer({
      debug: true,
      include: /\.(vue|ts|tsx)$/
    })
  ],
  build: {
    sourcemap: true
  }
})
```

### 3. 多环境配置示例

根据不同环境使用不同配置。

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const isTest = mode === 'test'

  const plugins = [vue()]

  // 只在开发和测试环境启用覆盖率
  if (isDev || isTest) {
    plugins.push(
      istanbul({
        include: 'src/**',
        exclude: ['node_modules', 'test/**'],
        forceBuildInstrument: true,
        requireEnv: false
      }),
      viteIstanbulTracer({
        debug: isDev, // 只在开发环境开启调试
        lineOffset: 0 // 自动检测
      })
    )
  }

  return {
    plugins,
    build: {
      sourcemap: isDev || isTest
    }
  }
})
```

### 4. E2E 测试配置示例

配合 Cypress 或 Playwright 进行 E2E 测试覆盖率收集。

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'

export default defineConfig({
  plugins: [
    vue(),
    istanbul({
      include: 'src/**',
      exclude: ['node_modules', 'test/**', 'cypress/**'],
      extension: ['.js', '.ts', '.vue'],
      cypress: true, // 启用 Cypress 支持
      requireEnv: false,
      forceBuildInstrument: true
    }),
    viteIstanbulTracer({
      debug: process.env.DEBUG === 'true'
    })
  ],
  build: {
    sourcemap: true
  },
  server: {
    port: 3000
  }
})
```

**Cypress 配置：**

```javascript
// cypress.config.js
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // 收集覆盖率
      require('@cypress/code-coverage/task')(on, config)
      return config
    }
  }
})
```

### 5. Monorepo 配置示例

在 Monorepo 项目中使用。

```javascript
// packages/app/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    istanbul({
      // 只收集当前包的覆盖率
      include: 'src/**',
      exclude: ['node_modules', 'test/**'],
      forceBuildInstrument: true
    }),
    viteIstanbulTracer({
      debug: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared/src')
    }
  },
  build: {
    sourcemap: true
  }
})
```

### 6. 自定义覆盖率变量名

如果需要使用自定义的覆盖率变量名。

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'

export default defineConfig({
  plugins: [
    vue(),
    istanbul({
      include: 'src/**',
      coverageVariable: '__my_coverage__', // 自定义变量名
      forceBuildInstrument: true
    }),
    viteIstanbulTracer({
      debug: true,
      // 更新检测模式以匹配自定义变量名
      pattern: /var cov_\w+\s*=|function cov_\w+\(\)|__my_coverage__/
    })
  ],
  build: {
    sourcemap: true
  }
})
```

## 完整项目示例

### 项目结构

```
my-project/
├── src/
│   ├── components/
│   │   └── HelloWorld.vue
│   ├── utils/
│   │   └── helpers.js
│   └── App.vue
├── test/
│   └── HelloWorld.spec.js
├── vite.config.js
├── package.json
└── .nycrc.json
```

### package.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "coverage": "vitest --coverage"
  },
  "dependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.0.0",
    "vite": "^4.0.0",
    "vite-plugin-istanbul": "^7.2.0",
    "@jt-coverage/vite-istanbul-tracer": "^0.0.2",
    "vitest": "^0.34.0",
    "@vitest/coverage-v8": "^0.34.0"
  }
}
```

### .nycrc.json

```json
{
  "all": true,
  "include": [
    "src/**/*.{js,ts,vue}"
  ],
  "exclude": [
    "**/*.spec.js",
    "**/*.test.js",
    "node_modules/**"
  ],
  "reporter": [
    "html",
    "lcov",
    "text",
    "text-summary"
  ],
  "sourceMap": true,
  "instrument": true
}
```

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'

export default defineConfig({
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
  ],
  build: {
    sourcemap: true
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

## 运行示例

### 1. 开发环境

```bash
# 启动开发服务器
npm run dev

# 打开浏览器访问 http://localhost:3000
# 打开浏览器控制台，查看覆盖率数据
console.log(window.__coverage__)
```

### 2. 查看覆盖率报告

```bash
# 运行测试并生成覆盖率报告
npm run coverage

# 查看 HTML 报告
open coverage/index.html
```

### 3. 调试

```bash
# 开启调试模式
DEBUG=true npm run dev

# 查看控制台输出
# [vite-istanbul-tracer] 检测到插桩代码，行偏移: 2, 文件: /src/App.vue
```

## 常见问题

### 1. 覆盖率数据为空

检查：
- 是否正确配置了 `forceBuildInstrument: true`
- 是否开启了 `sourcemap: true`
- 插件顺序是否正确

### 2. 行号偏移

尝试：
- 使用自动检测：`lineOffset: 0`
- 开启调试：`debug: true`
- 查看控制台日志

### 3. Vue SFC 文件问题

确保：
- `include` 包含 `.vue` 文件
- `extension` 包含 `.vue`
- 使用自动偏移检测

## 更多资源

- [完整文档](../README.md)
- [故障排查](../TROUBLESHOOTING.md)
- [与 coverage-source-map-trace-plugin 对比](../COMPARISON.md)
