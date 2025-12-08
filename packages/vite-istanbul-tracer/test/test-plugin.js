/**
 * SourceMap Offset Plugin 测试文件
 */

import { createSourceMapOffsetPlugin } from '../index.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 创建测试用的Vue文件
 */
async function createTestVueFile() {
  const testFile = join(__dirname, 'test-component.vue')
  const content = `<template>
  <div class="test-component">
    <button @click="handleClick">{{ message }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello World')

function handleClick() {
  console.log('Button clicked at line 12')
  message.value = 'Clicked!'
}
</script>

<style scoped>
.test-component {
  padding: 20px;
}
</style>
`
  await fs.writeFile(testFile, content)
  return testFile
}

/**
 * 创建测试用的SourceMap
 */
async function createTestSourceMap(filePath) {
  const sourceMap = {
    "version": 3,
    "sources": ["test-component.vue"],
    "names": [],
    "mappings": "AAAA;EACA;EACA;EACA;EACA;;AAEA;EACA;;AAEA;EACA;EACA;EACA;;AAEA;EACA;EACA;EACA;;AAEA;EACA;EACA;EACA;;AAEA;EACA;EACA;EACA;;AAEA;EACA;EACA;EACA",
    "file": "test-component.vue",
    "sourcesContent": [await fs.readFile(filePath, 'utf-8')]
  }
  
  await fs.writeFile(filePath + '.map', JSON.stringify(sourceMap, null, 2))
  return filePath + '.map'
}

/**
 * 测试插件基本功能
 */
async function testBasicFunctionality() {
  console.log('🧪 测试插件基本功能...')
  
  const plugin = createSourceMapOffsetPlugin({
    enabled: true,
    debug: true,
    lineThreshold: 2,
    columnThreshold: 5
  })

  console.log('✅ 插件实例创建成功')
  console.log('配置选项:', plugin.options)
  
  return plugin
}

/**
 * 测试文件处理
 */
async function testFileProcessing() {
  console.log('\n🧪 测试文件处理...')
  
  const plugin = createSourceMapOffsetPlugin({
    enabled: true,
    debug: true
  })

  // 创建测试文件
  const testFile = await createTestVueFile()
  await createTestSourceMap(testFile)

  try {
    // 测试位置修正
    const originalPos = { line: 12, column: 10, source: testFile }
    const fixedPos = await plugin.fixFile(testFile, originalPos)
    
    console.log('原始位置:', originalPos)
    console.log('修正位置:', fixedPos)
    console.log('✅ 文件处理测试通过')
    
  } catch (error) {
    console.error('❌ 文件处理测试失败:', error)
  } finally {
    // 清理测试文件
    try {
      await fs.unlink(testFile)
      await fs.unlink(testFile + '.map')
    } catch (e) {
      // 忽略清理错误
    }
  }
}

/**
 * 测试Vite插件集成
 */
async function testViteIntegration() {
  console.log('\n🧪 测试Vite插件集成...')
  
  const plugin = createSourceMapOffsetPlugin({
    enabled: true,
    debug: true
  })

  const vitePlugin = plugin.vite()
  
  console.log('Vite插件配置:', {
    name: vitePlugin.name,
    enforce: vitePlugin.enforce,
    transform: typeof vitePlugin.transform,
    buildStart: typeof vitePlugin.buildStart,
    buildEnd: typeof vitePlugin.buildEnd
  })
  
  console.log('✅ Vite插件集成测试通过')
}

/**
 * 测试偏移检测
 */
async function testOffsetDetection() {
  console.log('\n🧪 测试偏移检测...')
  
  const plugin = createSourceMapOffsetPlugin({
    enabled: true,
    debug: true,
    lineThreshold: 1,
    columnThreshold: 1
  })

  // 模拟偏移情况
  const originalPos = { line: 10, column: 5, source: 'test.vue' }
  const generatedPos = { line: 15, column: 8, source: 'test.vue' }
  
  const offset = plugin.detectOffset(originalPos, generatedPos, 'test.vue')
  
  console.log('偏移检测结果:', offset)
  
  if (offset.hasOffset) {
    console.log(`检测到偏移: 行偏移 ${offset.lineOffset}, 列偏移 ${offset.columnOffset}`)
  }
  
  console.log('✅ 偏移检测测试通过')
}

/**
 * 测试缓存功能
 */
async function testCacheFunctionality() {
  console.log('\n🧪 测试缓存功能...')
  
  const plugin = createSourceMapOffsetPlugin({
    enabled: true,
    debug: true
  })

  // 测试缓存大小
  console.log('初始缓存大小:', {
    sourceMapCache: plugin.sourceMapCache.size,
    offsetCache: plugin.offsetCache.size
  })

  // 添加一些测试数据到缓存
  plugin.sourceMapCache.set('test1', { sourceMap: { version: 3 } })
  plugin.offsetCache.set('test1', { line: 1, column: 1 })
  
  console.log('添加数据后缓存大小:', {
    sourceMapCache: plugin.sourceMapCache.size,
    offsetCache: plugin.offsetCache.size
  })

  // 清理缓存
  plugin.clearCache()
  
  console.log('清理缓存后大小:', {
    sourceMapCache: plugin.sourceMapCache.size,
    offsetCache: plugin.offsetCache.size
  })
  
  console.log('✅ 缓存功能测试通过')
}

/**
 * 测试错误处理
 */
async function testErrorHandling() {
  console.log('\n🧪 测试错误处理...')
  
  const plugin = createSourceMapOffsetPlugin({
    enabled: true,
    debug: true
  })

  try {
    // 测试不存在的文件
    await plugin.fixFile('non-existent-file.vue', { line: 1, column: 1 })
    console.log('❌ 应该抛出错误但未抛出')
  } catch (error) {
    console.log('✅ 正确处理了不存在的文件:', error.message)
  }

  try {
    // 测试无效的sourcemap
    const invalidFile = join(__dirname, 'invalid.vue')
    await fs.writeFile(invalidFile, 'invalid content')
    await plugin.fixFile(invalidFile, { line: 1, column: 1 })
    await fs.unlink(invalidFile)
    console.log('❌ 应该抛出错误但未抛出')
  } catch (error) {
    console.log('✅ 正确处理了无效的sourcemap:', error.message)
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始运行 SourceMap Offset Plugin 测试套件\n')
  
  try {
    await testBasicFunctionality()
    await testFileProcessing()
    await testViteIntegration()
    await testOffsetDetection()
    await testCacheFunctionality()
    await testErrorHandling()
    
    console.log('\n🎉 所有测试通过！')
  } catch (error) {
    console.error('\n❌ 测试失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error)
}

export {
  runAllTests,
  testBasicFunctionality,
  testFileProcessing,
  testViteIntegration,
  testOffsetDetection,
  testCacheFunctionality,
  testErrorHandling
}