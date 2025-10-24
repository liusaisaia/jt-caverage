// 测试 CoverageButton 组件的完整导入链
const testImports = async () => {
  try {
    // 测试 1: 直接导入组件
    const CoverageButton = await import('@jt-coverage/vue3/lib/CoverageButton.vue')
    console.log('✅ CoverageButton 组件导入成功')
    
    // 测试 2: 测试组件依赖
    const devCoverage = await import('@jt-coverage/vue3/lib/devCoverage.js')
    console.log('✅ devCoverage 工具函数导入成功')
    
    const nativeConfirm = await import('@jt-coverage/vue3/lib/native-confirm.js')
    console.log('✅ native-confirm 工具函数导入成功')
    
    // 测试 3: 验证函数存在
    console.log('可用函数:', {
      startCoveragePolling: typeof devCoverage.startCoveragePolling,
      stopCoveragePolling: typeof devCoverage.stopCoveragePolling,
      collectFinalCoverage: typeof devCoverage.collectFinalCoverage,
      $confirm: typeof nativeConfirm.$confirm
    })
    
    console.log('🎉 所有导入测试通过！')
    
  } catch (error) {
    console.error('❌ 导入测试失败:', error.message)
  }
}

// 运行测试
testImports()