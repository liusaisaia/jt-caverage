/**
 * 覆盖率数据溯源诊断工具类型定义
 */

export interface CoverageDiagnosisResult {
  /** 是否可以溯源 */
  canTrace: boolean;
  /** 严重问题列表（导致无法溯源） */
  issues: string[];
  /** 警告列表（不影响溯源但需注意） */
  warnings: string[];
  /** 文件路径 */
  filePath: string;
  /** 是否有 SourceMap */
  hasSourceMap: boolean;
  /** 语句数量 */
  statementCount: number;
}

export interface CoverageDiagnosisSummary {
  /** 总文件数 */
  total: number;
  /** 可溯源文件数 */
  canTrace: number;
  /** 无法溯源文件数 */
  cannotTrace: number;
  /** 有问题的文件数 */
  hasIssues: number;
  /** 有警告的文件数 */
  hasWarnings: number;
}

export interface CoverageDiagnosisReport {
  /** 诊断是否成功 */
  success: boolean;
  /** 错误信息（如果失败） */
  error?: string;
  /** 总体摘要 */
  summary?: CoverageDiagnosisSummary;
  /** 每个文件的详细结果 */
  results?: Record<string, CoverageDiagnosisResult>;
}

/**
 * 诊断单个文件的覆盖率数据
 */
export function diagnoseCoverageData(
  fileCoverage: any,
  filePath: string
): CoverageDiagnosisResult;

/**
 * 诊断整个覆盖率对象
 */
export function diagnoseAllCoverage(coverage: any): CoverageDiagnosisReport;

/**
 * 生成诊断报告（格式化输出）
 */
export function generateReport(diagnosis: CoverageDiagnosisReport): string;

/**
 * 浏览器环境全局函数
 */
declare global {
  interface Window {
    diagnoseCoverage(): CoverageDiagnosisReport;
  }
}
