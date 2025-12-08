/**
 * SourceMap 映射工具 V2 类型定义
 * 优先使用 inputSourceMap，自动修正覆盖率数据
 */

/**
 * 映射单个位置
 */
export interface Position {
  line: number;
  column: number;
}

/**
 * 映射单个文件的覆盖率数据
 * @param fileCoverage - 文件覆盖率数据
 * @param tracer - TraceMap 实例
 * @returns 是否修正成功
 */
export function mapFileCoverage(fileCoverage: any, tracer: any): boolean;

/**
 * 映射所有覆盖率数据
 * @param coverage - window.__coverage__ 对象
 * @returns 修正的文件数量
 */
export function mapAllCoverageV2(coverage?: any): Promise<number>;

/**
 * 自动执行修正（模块加载时自动执行）
 */
export {};
