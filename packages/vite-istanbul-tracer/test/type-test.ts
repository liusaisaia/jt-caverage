/**
 * TypeScript 类型测试
 */

import type { Plugin } from 'vite'
import { ViteIstanbulTracer, createViteIstanbulTracer } from '../index.js'
import type { ViteIstanbulTracerOptions } from '../index.js'

// 测试 1: 使用工厂函数（推荐方式）
const plugin1 = createViteIstanbulTracer({
  debug: true,
  lineOffset: 0,
  include: /\.(vue|js|ts)$/,
  exclude: /node_modules/
})

// 验证返回的是 Plugin 类型
const vitePlugin1: Plugin = plugin1

// 测试 2: 使用类实例
const tracer = new ViteIstanbulTracer({
  debug: true,
  lineOffset: 2
})

const plugin2 = tracer.vite()
const vitePlugin2: Plugin = plugin2

// 测试 3: 类型推断
const options: ViteIstanbulTracerOptions = {
  debug: true,
  lineOffset: 0,
  include: /\.vue$/,
  exclude: /node_modules/,
  pattern: /var cov_\w+/
}

// 测试 4: 方法调用
const hasInstrumentation: boolean = tracer.hasInstrumentation('var cov_123 = ...')
const offset: number = tracer.detectLineOffset('var cov_123 = ...')
tracer.clearCache()

// 测试 5: 默认导出
import viteIstanbulTracer from '../index.js'

const plugin3 = viteIstanbulTracer({
  debug: false
})

const vitePlugin3: Plugin = plugin3

// 测试 6: 在 Vite 配置中使用
const viteConfig = {
  plugins: [
    // 方式 1: 直接使用工厂函数
    createViteIstanbulTracer({ debug: true }),

    // 方式 2: 使用默认导出
    viteIstanbulTracer({ debug: true }),

    // 方式 3: 使用类实例
    new ViteIstanbulTracer({ debug: true }).vite()
  ]
}

console.log('✅ TypeScript 类型测试通过')
console.log('插件类型:', typeof plugin1)
console.log('Tracer 类型:', typeof tracer)
console.log('检测结果:', hasInstrumentation)
console.log('偏移量:', offset)
console.log('Vite 配置:', viteConfig.plugins.length, '个插件')
