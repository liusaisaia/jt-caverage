/**
 * SourceMap 映射工具 V1 类型定义
 * 从外部 .map 文件加载 SourceMap
 */

/**
 * 获取文件的 SourceMap
 * @param filePath - 文件路径
 * @returns SourceMap 对象
 */
export function getSourceMap(filePath: string): Promise<any | null>;

/**
 * 使用 SourceMap 映射位置
 * @param sourceMap - SourceMap 对象
 * @param line - 行号
 * @param column - 列号
 * @returns 原始位置
 */
export function mapPosition(
  sourceMap: any,
  line: number,
  column: number
): { line: number; column: number } | null;

/**
 * 映射单个文件的覆盖率数据
 * @param filePath - 文件路径
 * @param fileCoverage - 文件覆盖率数据
 * @returns 是否修正成功
 */
export function mapFileCoverage(
  filePath: string,
  fileCoverage: any
): Promise<boolean>;

/**
 * 映射所有覆盖率数据
 * @param coverage - window.__coverage__ 对象
 * @returns 修正的文件数量
 */
export function mapAllCoverage(coverage?: any): Promise<number>;
