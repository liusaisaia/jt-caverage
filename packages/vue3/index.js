const { getGitInfo, handleProjectName } = require('@jt-coverage/core')
const { writeFileSync: writeFileSync } = require('fs')
const path = require('path')

let cachedGitInfo = null

function ensureGitInfo(options = {}) {
  const raw = getGitInfo()
  const data = JSON.parse(raw)
  if (options.coverageVariable) {
    data.projectName = options.coverageVariable
    data.coverageKey = handleProjectName(options.coverageVariable)
  }
  cachedGitInfo = JSON.stringify(data)
  return { data, json: cachedGitInfo }
}

/**
 * 转换exclude选项格式，规范化exclude参数
 */
function normalizeExcludeOption(exclude) {
  // 如果exclude是数组，直接返回
  if (Array.isArray(exclude)) {
    return exclude
  }

  // 如果exclude是正则表达式，转换为字符串数组
  if (exclude instanceof RegExp) {
    return [exclude.source]
  }

  // 如果exclude是字符串，包装成数组
  if (typeof exclude === 'string') {
    return [exclude]
  }

  // 默认值
  return ['node_modules/**', 'tests/**', '**/*.test.js']
}

/**
 * 转换include选项格式，规范化include参数
 */
function normalizeIncludeOption(include) {
  // 如果include是数组，直接返回
  if (Array.isArray(include)) {
    return include
  }

  // 如果include是正则表达式，转换为glob模式
  if (include instanceof RegExp) {
    const source = include.source

    // 常见的文件扩展名模式转换
    if (source.includes('vue|js|jsx|ts|tsx|mjs')) {
      return ['src/**/*.{vue,js,jsx,ts,tsx,mjs}']
    }
    if (source.includes('vue|js|jsx|ts|tsx')) {
      return ['src/**/*.{vue,js,jsx,ts,tsx}']
    }
    if (source.includes('js|jsx|ts|tsx')) {
      return ['src/**/*.{js,jsx,ts,tsx}']
    }

    // 默认转换为src模式
    return ['src/**/*']
  }

  // 如果include是字符串，直接返回
  if (typeof include === 'string') {
    return include
  }

  // 默认值
  return ['src/**/*']
}

/**
 * 规范化选项配置，为插件提供统一的参数格式
 */
function normalizeOptions(options = {}) {
  return {
    ...options,
    requireEnv: false,
    forceBuildInstrument: true,
    exclude: normalizeExcludeOption(options.exclude),
    include: normalizeIncludeOption(options.include),
    extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.vue']
  }
}

/**
 * Vue3覆盖率插件主实现
 * 使用@weilinerl/vite-plugin-istanbul提供覆盖率功能
 */
async function createCoveragePlugin(options = {}, cb) {
  ensureGitInfo()
  writeFileSync('public/git-info.json', ensureGitInfo().json)

  try {
    // 使用@weilinerl/vite-plugin-istanbul插件
    const { default: istanbulPlugin } = await import('@weilinerl/vite-plugin-istanbul')

    if (typeof istanbulPlugin !== 'function') {
      throw new Error('@weilinerl/vite-plugin-istanbul 导出格式不兼容')
    }

    // 规范化插件选项
    const normalizedOptions = normalizeOptions(options)

    const plugin = istanbulPlugin(normalizedOptions)

    if (cb && typeof cb === 'function') {
      cb(null, plugin)
    }

    return plugin
  } catch (error) {
    console.error('[jt-coverage] 插件创建失败:', error.message)
    if (cb && typeof cb === 'function') {
      cb(error)
    }
    throw error
  }
}

/**
 * 向后兼容的增强版本 - 保持原有接口但使用新的实现
 */
async function createEnhancedCoveragePlugin(options = {}, cb) {
  // 目前增强版本与基础版本使用相同实现，未来可扩展
  return createCoveragePlugin(options, cb)
}



/**
 * 主入口函数 - 智能选择插件类型
 */
function jtCoveragePlugin(options = {}) {
  // 如果启用了SourceMap修正或明确要求，使用增强版本
  if (options.enableSourceMapFix || options.autoFix !== false) {
    return createEnhancedCoveragePlugin(options)
  }

  // 否则使用简单版本保持向后兼容
  return createCoveragePlugin(options)
}

/**
 * 工具函数：创建适用于Quasar的覆盖率配置
 */
function createQuasarHelper(options = {}) {
  return function (quasarConfig) {
    const coverageOptions = {
      include: options.include || 'src/**/*',
      exclude: options.exclude || ['node_modules/**', 'tests/**'],
      extension: options.extension || ['.js', '.ts', '.vue'],
      ...options,
      // Quasar特定配置
      coverageVariable: options.coverageVariable || 'quasar-coverage',
      forceBuildInstrument: true,
      requireEnv: false
    }

    return {
      ...quasarConfig,
      plugins: [
        ...(quasarConfig.plugins || []),
        jtCoveragePlugin(coverageOptions)
      ]
    }
  }
}

module.exports = {
  // 主函数
  jtCoveragePlugin,

  // 增强版本（包含SourceMap修正）
  createEnhancedCoveragePlugin,

  // 简单版本（向后兼容）
  createCoveragePlugin,

  // 工具函数
  createQuasarHelper,
  ensureGitInfo,

  // 组件导出
  get CoverageButton() {
    try {
      const component = require('./lib/CoverageButton.vue').default
      component.install = function (app) {
        app.component(component.name, component)
      }
      return component
    } catch (error) {
      console.warn('[jt-coverage] CoverageButton组件加载失败:', error.message)
      return null
    }
  },

  get NativeUI() {
    try {
      return require('./lib/native-ui.js').default
    } catch (error) {
      console.warn('[jt-coverage] NativeUI组件加载失败:', error.message)
      return null
    }
  },

  get $confirm() {
    try {
      return require('./lib/native-confirm.js').$confirm
    } catch (error) {
      console.warn('[jt-coverage] $confirm功能加载失败:', error.message)
      return null
    }
  },

  get $message() {
    try {
      return require('./lib/native-message.js').$message
    } catch (error) {
      console.warn('[jt-coverage] $message功能加载失败:', error.message)
      return null
    }
  }
}
