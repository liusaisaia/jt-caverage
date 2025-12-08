/**
 * Vue3 增强版覆盖率插件使用示例
 * 展示与 coverage-source-map-trace-plugin 等价的功能实现
 */

const { jtCoveragePlugin, createEnhancedCoveragePlugin, createQuasarHelper } = require('../index')

/**
 * 示例1: 智能模式 - 推荐用法
 * 自动检测并启用 SourceMap 修正功能
 */
function exampleSmartMode() {
  console.log('📋 示例1: 智能模式（推荐）')
  
  const config = {
    plugins: [
      // 其他插件...
      jtCoveragePlugin({
        include: 'src/**/*',
        exclude: ['node_modules/**', 'tests/**'],
        extension: ['.js', '.ts', '.vue'],
        coverageVariable: 'my-vue3-project',
        debug: true, // 启用调试查看详情
        autoFix: true, // 启用SourceMap自动修正
        enableSourceMapFix: true // 明确启用增强功能
      })
    ]
  }
  
  console.log('✅ 智能模式配置创建成功')
  return config
}

/**
 * 示例2: 增强模式 - 完整功能
 * 显式使用增强版插件，获得完整的 SourceMap 修正能力
 */
async function exampleEnhancedMode() {
  console.log('\n📋 示例2: 增强模式（完整功能）')
  
  const enhancedPlugin = await createEnhancedCoveragePlugin({
    include: 'src/**/*',
    exclude: ['node_modules/**', 'tests/**'],
    extension: ['.js', '.ts', '.vue'],
    coverageVariable: 'enhanced-vue3-project',
    debug: true,
    autoFix: true,
    enableSourceMapFix: true,
    requireSourceMapFix: true, // 强制要求SourceMap修正功能
    istanbulOptions: {
      instrumentCodePattern: /__cov_\w+|cov_\w+|__coverage__/,
      expectedLineOffset: 2,
      handleVueSFC: true
    }
  })
  
  console.log('✅ 增强版插件创建成功')
  console.log('🔧 插件类型:', Array.isArray(enhancedPlugin) ? '插件数组' : '单插件')
  console.log('📊 插件数量:', Array.isArray(enhancedPlugin) ? enhancedPlugin.length : 1)
  
  return {
    plugins: [
      // 其他插件...
      ...(Array.isArray(enhancedPlugin) ? enhancedPlugin : [enhancedPlugin])
    ]
  }
}

/**
 * 示例3: 基础模式 - 向后兼容
 * 仅使用基础 vite-plugin-istanbul 功能
 */
async function exampleBasicMode() {
  console.log('\n📋 示例3: 基础模式（向后兼容）')
  
  const basicPlugin = await jtCoveragePlugin({
    include: 'src/**/*',
    exclude: ['node_modules/**', 'tests/**'],
    extension: ['.js', '.ts', '.vue'],
    coverageVariable: 'basic-vue3-project',
    debug: false,
    autoFix: false // 明确禁用SourceMap修正
  })
  
  console.log('✅ 基础版插件创建成功')
  
  return {
    plugins: [
      // 其他插件...
      basicPlugin
    ]
  }
}

/**
 * 示例4: Quasar 框架集成
 * 使用专用的 Quasar 配置助手
 */
function exampleQuasarMode() {
  console.log('\n📋 示例4: Quasar 框架集成')
  
  const quasarCoverageHelper = createQuasarHelper({
    include: 'src/**/*',
    exclude: ['node_modules/**', 'tests/**'],
    extension: ['.js', '.ts', '.vue'],
    coverageVariable: 'quasar-project',
    debug: true
  })
  
  // 模拟 Quasar 配置
  const quasarConfig = {
    framework: {
      config: {}
    },
    plugins: []
  }
  
  const enhancedConfig = quasarCoverageHelper(quasarConfig)
  
  console.log('✅ Quasar 配置文件创建成功')
  console.log('📊 插件数量:', enhancedConfig.plugins.length)
  
  return enhancedConfig
}

/**
 * 示例5: TypeScript 项目配置
 * 专门的 TypeScript 类型安全配置
 */
function exampleTypeScriptMode() {
  console.log('\n📋 示例5: TypeScript 项目配置')
  
  const tsConfig = {
    plugins: [
      jtCoveragePlugin({
        include: 'src/**/*.{js,ts,vue}',
        exclude: [
          'node_modules/**',
          'tests/**',
          '**/*.d.ts',
          '**/*.test.{js,ts}',
          '**/*.spec.{js,ts}'
        ],
        extension: ['.js', '.ts', '.vue'],
        coverageVariable: 'typescript-vue3-project',
        debug: true,
        autoFix: true,
        enableSourceMapFix: true,
        istanbulOptions: {
          instrumentCodePattern: /__cov_\w+|cov_\w+|__coverage__/,
          expectedLineOffset: 2,
          handleVueSFC: true
        }
      })
    ],
    
    // Vite 配置
    build: {
      sourcemap: true, // 确保生成 SourceMap
      minify: false // 开发模式下可以禁用压缩
    },
    
    // 测试配置
    test: {
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/**',
          'tests/**',
          '**/*.d.ts'
        ]
      }
    }
  }
  
  console.log('✅ TypeScript 项目配置创建成功')
  return tsConfig
}

/**
 * 示例6: 生产环境优化配置
 * 针对生产环境的优化设置
 */
function exampleProductionMode() {
  console.log('\n📋 示例6: 生产环境优化配置')
  
  const isProduction = process.env.NODE_ENV === 'production'
  
  const prodConfig = {
    plugins: [
      jtCoveragePlugin({
        include: isProduction ? 'src/**/*' : 'src/**/*',
        exclude: [
          'node_modules/**',
          'tests/**',
          '**/*.test.{js,ts}',
          '**/*.spec.{js,ts}'
        ],
        extension: ['.js', '.ts', '.vue'],
        coverageVariable: 'production-vue3-project',
        debug: !isProduction, // 生产环境关闭调试
        autoFix: true, // 生产环境也需要修正
        enableSourceMapFix: true,
        istanbulOptions: {
          instrumentCodePattern: /__cov_\w+|cov_\w+|__coverage__/,
          expectedLineOffset: 2,
          handleVueSFC: true
        }
      })
    ],
    
    build: {
      sourcemap: true, // 生产环境保留 SourceMap 用于修正
      minify: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            coverage: ['@jt-coverage/core', '@jt-coverage/vue3']
          }
        }
      }
    }
  }
  
  console.log('✅ 生产环境配置创建成功')
  console.log('🔧 生产模式:', isProduction ? '启用' : '禁用')
  return prodConfig
}

/**
 * 展示与 coverage-source-map-trace-plugin 的功能对比
 */
function demonstrateEquivalence() {
  console.log('\n📋 功能等价性说明')
  
  console.log('\n🎯 coverage-source-map-trace-plugin 的功能:')
  console.log('  ✅ Webpack loader 修正')
  console.log('  ✅ Babel 插件修正')
  console.log('  ✅ SourceMap 缓存优化')
  console.log('  ✅ 自动偏移检测')
  
  console.log('\n🎯 vue3 增强版实现的功能:')
  console.log('  ✅ Vite 插件修正')
  console.log('  ✅ 构建时 + 运行时双重修正')
  console.log('  ✅ 智能缓存机制')
  console.log('  ✅ 自动偏移检测与修正')
  console.log('  ✅ Vue SFC 特殊处理')
  console.log('  ✅ @jridgewell/trace-mapping 高性能映射')
  
  console.log('\n🔄 主要差异:')
  console.log('  - Webpack → Vite 构建系统')
  console.log('  - Loader/Babel → Vite Plugin 接口')
  console.log('  - 单一修正 → 构建时+运行时双重修正')
  console.log('  - Webpack 生态 → Vue3 生态深度集成')
}

// 主函数
async function runExamples() {
  console.log('🚀 Vue3 增强版覆盖率插件使用示例\n')
  console.log('=' * 60)
  
  try {
    // 基础示例
    exampleSmartMode()
    
    // 异步示例
    await exampleEnhancedMode()
    await exampleBasicMode()
    
    // 特殊框架示例
    exampleQuasarMode()
    exampleTypeScriptMode()
    exampleProductionMode()
    
    // 功能对比
    demonstrateEquivalence()
    
    console.log('\n' + '=' * 60)
    console.log('🎉 所有示例执行完成！')
    console.log('💡 提示: 选择最适合您项目需求的配置方式')
    
  } catch (error) {
    console.error('❌ 示例执行失败:', error.message)
  }
}

// 导出示例函数
module.exports = {
  exampleSmartMode,
  exampleEnhancedMode,
  exampleBasicMode,
  exampleQuasarMode,
  exampleTypeScriptMode,
  exampleProductionMode,
  demonstrateEquivalence,
  runExamples
}

// 如果直接运行此文件
if (require.main === module) {
  runExamples()
}