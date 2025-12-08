// 类型测试的 JavaScript 版本
import { createSourceMapOffsetPlugin } from '../index.js'

// 测试插件实例创建
const plugin = createSourceMapOffsetPlugin({
  enabled: true,
  debug: true
})

// 测试插件名称属性
const pluginName = plugin.name

// 测试插件配置选项
const pluginOptions = plugin.pluginOptions

// 测试 Vite 插件接口
const vitePlugin = plugin.vite()

// 测试 Webpack 插件接口
const webpackPlugin = plugin.webpack()

console.log('✅ 类型测试通过')
console.log('插件名称:', pluginName)
console.log('插件配置:', pluginOptions)
console.log('Vite插件名称:', vitePlugin.name)
console.log('Webpack插件存在:', !!webpackPlugin)