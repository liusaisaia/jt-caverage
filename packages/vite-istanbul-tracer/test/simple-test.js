/**
 * 简单测试文件
 */

import { createViteIstanbulTracer } from '../index.js'

console.log('🚀 开始简单测试...')

try {
  const plugin = createViteIstanbulTracer({
    autoFix: true,
    debug: true
  })

  console.log('✅ 插件创建成功')
  console.log('插件配置:', plugin.pluginOptions)
  
  // 测试Vite插件接口
  const vitePlugin = plugin.vite()
  console.log('Vite插件名称:', vitePlugin.name)
  
  // 测试插桩检测
  const testCode = `
    const __cov_abc123 = { ... };
    function test() {
      cov_abc123.f[0]++;
    }
  `
  const hasInstrumentation = plugin.hasIstanbulInstrumentation(testCode)
  console.log('插桩检测结果:', hasInstrumentation)
  
  console.log('🎉 简单测试完成！')
  
} catch (error) {
  console.error('❌ 测试失败:', error)
  process.exit(1)
}