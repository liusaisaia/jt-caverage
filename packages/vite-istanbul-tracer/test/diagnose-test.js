/**
 * 诊断工具测试
 */

import { diagnoseCoverageData, diagnoseAllCoverage, generateReport } from '../diagnose-coverage.js';

console.log('🧪 开始测试诊断工具...\n');

// 测试 1: 完整的覆盖率数据（可溯源）
console.log('测试 1: 完整的覆盖率数据');
const goodCoverage = {
  path: '/src/App.vue',
  s: { '0': 1, '1': 1 },
  f: { '0': 1 },
  b: {},
  statementMap: {
    '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    '1': { start: { line: 2, column: 0 }, end: { line: 2, column: 15 } }
  },
  fnMap: {
    '0': {
      name: 'test',
      decl: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } }
    }
  },
  branchMap: {},
  inputSourceMap: {
    version: 3,
    sources: ['App.vue'],
    mappings: 'AAAA,AACA',
    sourcesContent: ['<template>\n  <div>Test</div>\n</template>']
  }
};

const result1 = diagnoseCoverageData(goodCoverage, '/src/App.vue');
console.log('结果:', result1.canTrace ? '✅ 可溯源' : '❌ 无法溯源');
if (result1.issues.length > 0) {
  console.log('问题:', result1.issues);
}
if (result1.warnings.length > 0) {
  console.log('警告:', result1.warnings);
}
console.log('');

// 测试 2: 缺少 inputSourceMap（无法溯源）
console.log('测试 2: 缺少 inputSourceMap');
const badCoverage1 = {
  path: '/src/utils.js',
  s: { '0': 1 },
  f: {},
  b: {},
  statementMap: {
    '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } }
  },
  fnMap: {},
  branchMap: {}
  // 缺少 inputSourceMap
};

const result2 = diagnoseCoverageData(badCoverage1, '/src/utils.js');
console.log('结果:', result2.canTrace ? '✅ 可溯源' : '❌ 无法溯源');
if (result2.issues.length > 0) {
  console.log('问题:', result2.issues);
}
console.log('');

// 测试 3: inputSourceMap.sources 为空（无法溯源）
console.log('测试 3: inputSourceMap.sources 为空');
const badCoverage2 = {
  path: '/src/helper.js',
  s: { '0': 1 },
  f: {},
  b: {},
  statementMap: {
    '0': { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } }
  },
  fnMap: {},
  branchMap: {},
  inputSourceMap: {
    version: 3,
    sources: [], // 空数组
    mappings: 'AAAA'
  }
};

const result3 = diagnoseCoverageData(badCoverage2, '/src/helper.js');
console.log('结果:', result3.canTrace ? '✅ 可溯源' : '❌ 无法溯源');
if (result3.issues.length > 0) {
  console.log('问题:', result3.issues);
}
console.log('');

// 测试 4: 行号异常大（有警告）
console.log('测试 4: 行号异常大');
const warnCoverage = {
  path: '/src/Home.vue',
  s: { '0': 1 },
  f: {},
  b: {},
  statementMap: {
    '0': { start: { line: 15234, column: 0 }, end: { line: 15234, column: 20 } }
  },
  fnMap: {},
  branchMap: {},
  inputSourceMap: {
    version: 3,
    sources: ['Home.vue'],
    mappings: 'AAAA',
    sourcesContent: ['<template>\n  <div>Home</div>\n</template>']
  }
};

const result4 = diagnoseCoverageData(warnCoverage, '/src/Home.vue');
console.log('结果:', result4.canTrace ? '✅ 可溯源' : '❌ 无法溯源');
if (result4.warnings.length > 0) {
  console.log('警告:', result4.warnings);
}
console.log('');

// 测试 5: 诊断整个覆盖率对象
console.log('测试 5: 诊断整个覆盖率对象');
const allCoverage = {
  '/src/App.vue': goodCoverage,
  '/src/utils.js': badCoverage1,
  '/src/helper.js': badCoverage2,
  '/src/Home.vue': warnCoverage
};

const diagnosis = diagnoseAllCoverage(allCoverage);
console.log('\n' + generateReport(diagnosis));

// 验证测试结果
console.log('\n🎯 测试验证:');
let passed = 0;
let failed = 0;

if (result1.canTrace && result1.issues.length === 0) {
  console.log('✅ 测试 1 通过: 完整数据可溯源');
  passed++;
} else {
  console.log('❌ 测试 1 失败');
  failed++;
}

if (!result2.canTrace && result2.issues.includes('缺少 inputSourceMap，无法进行源码映射')) {
  console.log('✅ 测试 2 通过: 正确识别缺少 inputSourceMap');
  passed++;
} else {
  console.log('❌ 测试 2 失败');
  failed++;
}

if (!result3.canTrace && result3.issues.includes('inputSourceMap.sources 为空')) {
  console.log('✅ 测试 3 通过: 正确识别 sources 为空');
  passed++;
} else {
  console.log('❌ 测试 3 失败');
  failed++;
}

if (result4.canTrace && result4.warnings.some(w => w.includes('行号异常大'))) {
  console.log('✅ 测试 4 通过: 正确识别行号异常');
  passed++;
} else {
  console.log('❌ 测试 4 失败');
  failed++;
}

if (diagnosis.success && diagnosis.summary.total === 4 && diagnosis.summary.canTrace === 2 && diagnosis.summary.cannotTrace === 2) {
  console.log('✅ 测试 5 通过: 整体诊断统计正确');
  passed++;
} else {
  console.log('❌ 测试 5 失败');
  console.log('  期望: total=4, canTrace=2, cannotTrace=2');
  console.log('  实际:', diagnosis.summary);
  failed++;
}

console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败`);

if (failed === 0) {
  console.log('🎉 所有测试通过！');
  process.exit(0);
} else {
  console.log('❌ 部分测试失败');
  process.exit(1);
}
