/**
 * 覆盖率数据溯源诊断工具
 * 用于判断给定的覆盖率数据是否可以进行源码溯源
 */

/**
 * 诊断单个文件的覆盖率数据
 * @param {Object} fileCoverage - 单个文件的覆盖率数据
 * @param {string} filePath - 文件路径
 * @returns {Object} 诊断结果
 */
function diagnoseCoverageData(fileCoverage, filePath) {
  const issues = [];
  const warnings = [];
  let canTrace = true;

  // 1. 检查基本结构
  if (!fileCoverage) {
    issues.push('覆盖率数据为空');
    return { canTrace: false, issues, warnings };
  }

  // 2. 检查关键字段
  const requiredFields = ['path', 's', 'f', 'b', 'statementMap', 'fnMap', 'branchMap'];
  for (const field of requiredFields) {
    if (!(field in fileCoverage)) {
      issues.push(`缺少必需字段: ${field}`);
      canTrace = false;
    }
  }

  // 3. 检查路径信息
  if (fileCoverage.path) {
    if (fileCoverage.path.includes('?')) {
      warnings.push(`路径包含查询参数: ${fileCoverage.path}`);
    }
    if (fileCoverage.path.includes('node_modules')) {
      warnings.push('路径指向 node_modules，可能不需要溯源');
    }
  }

  // 4. 检查 inputSourceMap
  if (!fileCoverage.inputSourceMap) {
    issues.push('缺少 inputSourceMap，无法进行源码映射');
    canTrace = false;
  } else {
    // 检查 sourceMap 的完整性
    const sm = fileCoverage.inputSourceMap;

    if (!sm.sources || sm.sources.length === 0) {
      issues.push('inputSourceMap.sources 为空');
      canTrace = false;
    }

    if (!sm.mappings) {
      issues.push('inputSourceMap.mappings 为空');
      canTrace = false;
    }

    if (!sm.sourcesContent || sm.sourcesContent.length === 0) {
      warnings.push('inputSourceMap.sourcesContent 为空，可能需要加载外部 .map 文件');
    }

    // 检查 sources 路径
    if (sm.sources) {
      sm.sources.forEach((source, idx) => {
        if (source.includes('?')) {
          warnings.push(`sources[${idx}] 包含查询参数: ${source}`);
        }
      });
    }
  }

  // 5. 检查语句映射的行号范围
  if (fileCoverage.statementMap) {
    const statements = Object.values(fileCoverage.statementMap);
    if (statements.length === 0) {
      warnings.push('statementMap 为空，没有可执行语句');
    } else {
      const lines = statements.map(s => s.start?.line).filter(Boolean);
      if (lines.length > 0) {
        const minLine = Math.min(...lines);
        const maxLine = Math.max(...lines);

        if (minLine < 1) {
          issues.push(`存在无效行号: ${minLine}`);
          canTrace = false;
        }

        // 检查是否是 Vue SFC 编译后的行号（通常会很大）
        if (maxLine > 10000) {
          warnings.push(`行号异常大 (${maxLine})，可能是编译后未修正的行号`);
        }
      }
    }
  }

  // 6. 检查数据一致性
  if (fileCoverage.s && fileCoverage.statementMap) {
    const sKeys = Object.keys(fileCoverage.s);
    const smKeys = Object.keys(fileCoverage.statementMap);
    if (sKeys.length !== smKeys.length) {
      warnings.push(`语句计数(${sKeys.length})与语句映射(${smKeys.length})数量不匹配`);
    }
  }

  return {
    canTrace,
    issues,
    warnings,
    filePath: fileCoverage.path || filePath,
    hasSourceMap: !!fileCoverage.inputSourceMap,
    statementCount: fileCoverage.statementMap ? Object.keys(fileCoverage.statementMap).length : 0
  };
}

/**
 * 诊断整个覆盖率对象
 * @param {Object} coverage - window.__coverage__ 对象
 * @returns {Object} 诊断报告
 */
function diagnoseAllCoverage(coverage) {
  if (!coverage || typeof coverage !== 'object') {
    return {
      success: false,
      error: '覆盖率数据无效或为空'
    };
  }

  const results = {};
  const summary = {
    total: 0,
    canTrace: 0,
    cannotTrace: 0,
    hasIssues: 0,
    hasWarnings: 0
  };

  for (const [filePath, fileCoverage] of Object.entries(coverage)) {
    const result = diagnoseCoverageData(fileCoverage, filePath);
    results[filePath] = result;

    summary.total++;
    if (result.canTrace) {
      summary.canTrace++;
    } else {
      summary.cannotTrace++;
    }
    if (result.issues.length > 0) {
      summary.hasIssues++;
    }
    if (result.warnings.length > 0) {
      summary.hasWarnings++;
    }
  }

  return {
    success: true,
    summary,
    results
  };
}

/**
 * 生成诊断报告（格式化输出）
 * @param {Object} diagnosis - 诊断结果
 * @returns {string} 格式化的报告
 */
function generateReport(diagnosis) {
  if (!diagnosis.success) {
    return `❌ 诊断失败: ${diagnosis.error}`;
  }

  const lines = [];
  lines.push('='.repeat(80));
  lines.push('覆盖率数据溯源诊断报告');
  lines.push('='.repeat(80));
  lines.push('');

  // 总体摘要
  lines.push('📊 总体摘要:');
  lines.push(`  总文件数: ${diagnosis.summary.total}`);
  lines.push(`  ✅ 可溯源: ${diagnosis.summary.canTrace}`);
  lines.push(`  ❌ 无法溯源: ${diagnosis.summary.cannotTrace}`);
  lines.push(`  ⚠️  有问题: ${diagnosis.summary.hasIssues}`);
  lines.push(`  ⚡ 有警告: ${diagnosis.summary.hasWarnings}`);
  lines.push('');

  // 详细结果
  lines.push('📋 详细结果:');
  lines.push('');

  for (const [filePath, result] of Object.entries(diagnosis.results)) {
    const status = result.canTrace ? '✅' : '❌';
    lines.push(`${status} ${filePath}`);
    lines.push(`   语句数: ${result.statementCount}`);
    lines.push(`   SourceMap: ${result.hasSourceMap ? '有' : '无'}`);

    if (result.issues.length > 0) {
      lines.push('   ❌ 问题:');
      result.issues.forEach(issue => {
        lines.push(`      - ${issue}`);
      });
    }

    if (result.warnings.length > 0) {
      lines.push('   ⚠️  警告:');
      result.warnings.forEach(warning => {
        lines.push(`      - ${warning}`);
      });
    }

    lines.push('');
  }

  // 建议
  lines.push('💡 建议:');
  if (diagnosis.summary.cannotTrace > 0) {
    lines.push('  1. 检查 vite-plugin-istanbul 配置，确保 forceBuildInstrument 为 true');
    lines.push('  2. 确认 Vite 配置中 build.sourcemap 为 true');
    lines.push('  3. 使用 vite-istanbul-tracer 插件修正行号映射');
    lines.push('  4. 检查 Vue 文件是否正确编译并生成了 SourceMap');
  } else {
    lines.push('  所有文件都可以溯源，如果仍有行号偏移问题，请检查:');
    lines.push('  1. SourceMap 映射逻辑是否正确');
    lines.push('  2. 是否需要使用运行时修正工具');
  }

  lines.push('');
  lines.push('='.repeat(80));

  return lines.join('\n');
}

// 浏览器环境使用
if (typeof window !== 'undefined') {
  window.diagnoseCoverage = function() {
    const coverage = window.__coverage__;
    if (!coverage) {
      console.error('❌ 未找到 window.__coverage__ 数据');
      return;
    }

    const diagnosis = diagnoseAllCoverage(coverage);
    const report = generateReport(diagnosis);
    console.log(report);

    return diagnosis;
  };

  console.log('✅ 诊断工具已加载，在控制台运行 diagnoseCoverage() 开始诊断');
}

// Node.js 环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    diagnoseCoverageData,
    diagnoseAllCoverage,
    generateReport
  };
}

// ES 模块导出
export {
  diagnoseCoverageData,
  diagnoseAllCoverage,
  generateReport
};
