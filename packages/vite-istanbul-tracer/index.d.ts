import type { Plugin } from 'vite'

/**
 * Vite Istanbul Tracer 插件配置选项
 */
export interface ViteIstanbulTracerOptions {
  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean

  /**
   * 包含的文件匹配规则
   * @default /\.(vue|js|jsx|ts|tsx|mjs)$/
   */
  include?: RegExp

  /**
   * 排除的文件匹配规则
   * @default /node_modules/
   */
  exclude?: RegExp

  /**
   * 行偏移量
   * 0 表示自动检测（推荐）
   * @default 0
   */
  lineOffset?: number

  /**
   * 插桩代码检测模式
   * @default /var cov_\w+\s*=|function cov_\w+\(\)|__coverage__/
   */
  pattern?: RegExp
}

/**
 * Vite Istanbul Tracer 插件类
 * 专为 vite-plugin-istanbul 设计的 sourcemap 偏移修正插件
 */
export declare class ViteIstanbulTracer {
  /**
   * 创建插件实例
   * @param options 配置选项
   */
  constructor(options?: ViteIstanbulTracerOptions)

  /**
   * 插件配置选项
   */
  options: Required<ViteIstanbulTracerOptions>

  /**
   * 已处理文件集合（用于缓存）
   */
  processedFiles: Set<string>

  /**
   * 返回 Vite 插件对象
   * @returns Vite 插件
   */
  vite(): Plugin

  /**
   * 检测代码中是否包含 Istanbul 插桩代码
   * @param code 源代码
   * @returns 是否包含插桩代码
   */
  hasInstrumentation(code: string): boolean

  /**
   * 检测实际的行偏移量
   * 通过分析插桩代码的位置来确定偏移量
   * @param code 源代码
   * @returns 行偏移量
   */
  detectLineOffset(code: string): number

  /**
   * 修正 sourcemap 偏移（核心方法）
   * @param sourceMap 原始 sourcemap
   * @param lineOffset 行偏移量（可选，不传则使用配置的偏移量）
   * @returns 修正后的 sourcemap
   */
  fixSourceMap(sourceMap: any, lineOffset?: number): Promise<any>

  /**
   * 清除缓存
   */
  clearCache(): void
}

/**
 * 创建 Vite Istanbul Tracer 插件（工厂函数）
 *
 * @param options 配置选项
 * @returns Vite 插件对象
 *
 * @example
 * ```typescript
 * import viteIstanbulTracer from '@jt-coverage/vite-istanbul-tracer'
 *
 * export default {
 *   plugins: [
 *     viteIstanbulTracer({
 *       debug: true,
 *       lineOffset: 0
 *     })
 *   ]
 * }
 * ```
 */
export declare function createViteIstanbulTracer(options?: ViteIstanbulTracerOptions): Plugin

/**
 * 默认导出：工厂函数
 */
export default createViteIstanbulTracer

/**
 * 命名导出
 */
export { ViteIstanbulTracer, createViteIstanbulTracer }
