/**
 * Vite Coverage Trace Plugin 类型定义
 */

import type { Plugin } from 'vite'

/**
 * Vite 覆盖率追踪插件配置选项
 */
export interface ViteCoverageTraceOptions {
  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean

  /**
   * 包含的文件匹配规则
   * @default /\.(vue|js|jsx|ts|tsx)$/
   */
  include?: RegExp

  /**
   * 排除的文件匹配规则
   * @default /node_modules/
   */
  exclude?: RegExp
}

/**
 * Vite 覆盖率追踪插件
 * 在构建时修正覆盖率数据的行号
 *
 * @param options 配置选项
 * @returns Vite 插件
 *
 * @example
 * ```typescript
 * import viteCoverageTrace from '@jt-coverage/vite-istanbul-tracer/vite-coverage-trace'
 *
 * export default {
 *   plugins: [
 *     istanbul(),
 *     viteCoverageTrace({
 *       debug: true
 *     })
 *   ]
 * }
 * ```
 */
export function viteCoverageTracePlugin(options?: ViteCoverageTraceOptions): Plugin

/**
 * 工厂函数（别名）
 */
export function createViteCoverageTracePlugin(options?: ViteCoverageTraceOptions): Plugin

/**
 * 默认导出
 */
export default viteCoverageTracePlugin
