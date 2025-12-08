/**
 * 运行时覆盖率数据修正工具类型定义
 */

/**
 * 检测插桩代码占用的行数
 * @param code - 源代码
 * @returns 偏移行数
 */
export function detectOffset(code: string): number;

/**
 * 修正覆盖率数据中的行号
 * @param coverage - 覆盖率数据对象
 * @param offset - 行偏移量
 */
export function fixCoverage(coverage: any, offset: number): void;

/**
 * 修正单个文件的覆盖率数据
 * @param fileCoverage - 文件覆盖率数据
 * @param offset - 行偏移量
 */
export function fixFileCoverage(fileCoverage: any, offset: number): void;

/**
 * 自动修正所有覆盖率数据
 * @param coverage - window.__coverage__ 对象
 * @returns 修正的文件数量
 */
export function autoFixCoverage(coverage?: any): number;
