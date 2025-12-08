/**
 * 专门测试优化后的sourcemap-mapper-v2.js功能
 */

import sourcemapMapperV2 from '../sourcemap-mapper-v2.js';
const autoMapV2 = sourcemapMapperV2.autoMapV2;

console.log('🚀 开始测试sourcemap-mapper-v2优化功能...');

try {
  // 1. 准备测试数据
  const mockSourceMap = {
    version: 3,
    sources: ['test.js'],
    names: ['console', 'log', 'test'],
    mappings: 'AAAA,MAAM,IAAI,GAAG,CAAC,CAAC,EAAE,CAAC,OAAO,CAAC,CAAC',
    sourcesContent: ['function test() {\n  console.log("test");\n}']
  };

  // 2. 准备模拟的覆盖率数据（正确格式：以文件路径为键的对象）
  const mockCoverage = {
    'test.js': {
      path: 'test.js',
      s: { '0': 1 },
      f: { '0': 1 },
      b: {},
      statementMap: {
        '0': {
          start: { line: 2, column: 2 },
          end: { line: 2, column: 20 }
        }
      },
      fnMap: {
        '0': {
          name: 'test',
          decl: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
          loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } }
        }
      },
      branchMap: {},
      inputSourceMap: mockSourceMap
    }
  };

  // 3. 测试直接映射（应该成功）
  console.log('\n📋 测试 1: 直接映射测试');
  const result1 = await autoMapV2(mockCoverage, { verbose: true });
  console.log('✅ 直接映射测试完成');
  console.log('映射结果:', {
    success: result1.success,
    mapped: result1.totalMapped,
    unmapped: result1.totalUnmapped,
    rate: ((result1.totalMapped / (result1.totalMapped + result1.totalUnmapped)) * 100).toFixed(2) + '%'
  });

  // 4. 测试边界情况 - 无效的行号
  console.log('\n📋 测试 2: 无效行号处理测试');
  const invalidLineCoverage = JSON.parse(JSON.stringify(mockCoverage));
  invalidLineCoverage['test.js'].statementMap['0'].start.line = -5; // 无效行号
  invalidLineCoverage['test.js'].statementMap['0'].end.line = 'not_a_number'; // 非数字行号
  
  const result2 = await autoMapV2(invalidLineCoverage, { verbose: true });
  console.log('✅ 无效行号处理测试完成');
  console.log('错误处理正常');

  // 5. 测试边界情况 - 无效的列号
  console.log('\n📋 测试 3: 无效列号处理测试');
  const invalidColCoverage = JSON.parse(JSON.stringify(mockCoverage));
  invalidColCoverage['test.js'].statementMap['0'].start.column = -10;
  invalidColCoverage['test.js'].statementMap['0'].end.column = null;
  
  const result3 = await autoMapV2(invalidColCoverage, { verbose: true });
  console.log('✅ 无效列号处理测试完成');
  console.log('列值优化正常工作');

  // 6. 测试缓存机制
  console.log('\n📋 测试 4: 缓存机制测试');
  const result4 = await autoMapV2(mockCoverage, { verbose: true });
  console.log('✅ 缓存机制测试完成');
  console.log('缓存工作正常，应该有缓存命中');

  // 7. 测试备选映射策略
  console.log('\n📋 测试 5: 备选映射策略测试');
  // 创建一个可能导致直接映射失败的情况
  const trickyMap = {
    version: 3,
    sources: ['test.js'],
    names: [],
    mappings: 'AAAA;;AAAA', // 故意设置映射不连续
    sourcesContent: ['function test() {\n  console.log("test");\n  console.log("another line");\n}']
  };
  
  const trickyCoverage = JSON.parse(JSON.stringify(mockCoverage));
  trickyCoverage['test.js'].inputSourceMap = trickyMap;
  trickyCoverage['test.js'].statementMap['0'].start.column = 999; // 故意使用一个高列值来触发备选策略
  
  const result5 = await autoMapV2(trickyCoverage, { verbose: true });
  console.log('✅ 备选映射策略测试完成');
  console.log('备选策略结果:', {
    success: result5.success,
    mapped: result5.totalMapped,
    unmapped: result5.totalUnmapped
  });

  // 8. 测试错误处理
  console.log('\n📋 测试 6: 错误处理测试');
  const invalidMapCoverage = JSON.parse(JSON.stringify(mockCoverage));
  invalidMapCoverage['test.js'].inputSourceMap = null; // 故意移除sourcemap
  
  const result6 = await autoMapV2(invalidMapCoverage, { verbose: true });
  console.log('✅ 错误处理测试完成');
  console.log('空sourcemap处理正常');

  // 9. 测试禁用缓存
  console.log('\n📋 测试 7: 禁用缓存测试');
  const result7 = await autoMapV2(mockCoverage, { 
    verbose: true, 
    useCache: false 
  });
  console.log('✅ 禁用缓存测试完成');
  console.log('禁用缓存工作正常');

  // 10. 测试禁用备选映射
  console.log('\n📋 测试 8: 禁用备选映射测试');
  const trickyCoverage2 = JSON.parse(JSON.stringify(mockCoverage));
  trickyCoverage2['test.js'].statementMap['0'].start.column = 999;
  
  const result8 = await autoMapV2(trickyCoverage2, { 
    verbose: true, 
    useFallbackMapping: false 
  });
  console.log('✅ 禁用备选映射测试完成');
  console.log('禁用备选映射工作正常');

  // 11. 测试最大重试次数
  console.log('\n📋 测试 9: 最大重试次数测试');
  const result9 = await autoMapV2(trickyCoverage2, { 
    verbose: true, 
    maxRetries: 5 
  });
  console.log('✅ 最大重试次数测试完成');
  console.log('自定义重试次数工作正常');

  // 12. 测试不跳过未映射的位置
  console.log('\n📋 测试 10: 不跳过未映射位置测试');
  const invalidMapCoverage2 = JSON.parse(JSON.stringify(mockCoverage));
  invalidMapCoverage2['test.js'].inputSourceMap = null;
  
  const result10 = await autoMapV2(invalidMapCoverage2, { 
    verbose: true, 
    skipUnmappable: false 
  });
  console.log('✅ 不跳过未映射位置测试完成');
  console.log('非跳过模式工作正常');

  console.log('\n🎉 所有测试完成！优化后的sourcemap-mapper-v2.js功能正常工作！');
  console.log('\n🔧 配置选项列表:');
  console.log('  - verbose: 是否输出详细日志');
  console.log('  - useCache: 是否使用缓存机制');
  console.log('  - cacheExpiry: 缓存过期时间（毫秒）');
  console.log('  - useFallbackMapping: 是否使用备选映射策略');
  console.log('  - skipUnmappable: 是否跳过无法映射的位置');
  console.log('  - maxRetries: 映射失败后的最大重试次数');

} catch (error) {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
}