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
    const plugins = []

    // 1. 添加 vite-plugin-istanbul 插桩插件
    const { default: istanbulPlugin } = await import('vite-plugin-istanbul')

    if (typeof istanbulPlugin !== 'function') {
      throw new Error('vite-plugin-istanbul 导出格式不兼容')
    }

    // 规范化插件选项
    const normalizedOptions = normalizeOptions(options)
    const istanbulPluginInstance = istanbulPlugin(normalizedOptions)
    plugins.push(istanbulPluginInstance)

    // 2. 自动添加 vite-istanbul-tracer 修正偏移（除非明确禁用）
    if (options.autoFix !== false && options.disableTracer !== true) {
      try {
        const { createViteIstanbulTracer } = await import('@jt-coverage/vite-istanbul-tracer')

        const tracerPlugin = createViteIstanbulTracer({
          debug: options.debug || false,
          autoFix: true,
          include: normalizedOptions.include || /\.(vue|js|jsx|ts|tsx)$/,
          exclude: normalizedOptions.exclude || /node_modules/,
          istanbulOptions: {
            instrumentCodePattern: /__cov_\w+|cov_\w+|__coverage__/,
            expectedLineOffset: options.expectedLineOffset || 2,
            handleVueSFC: true
          }
        }).vite()

        plugins.push(tracerPlugin)

        if (options.debug) {
          console.log('[jt-coverage] ✅ 已自动集成 vite-istanbul-tracer，将修正 SourceMap 偏移')
        }
      } catch (tracerError) {
        console.warn('[jt-coverage] ⚠️  vite-istanbul-tracer 加载失败，将不会修正行号偏移:', tracerError.message)
        console.warn('[jt-coverage] 💡 建议安装: npm install @jt-coverage/vite-istanbul-tracer')
      }
    } else if (options.debug) {
      console.log('[jt-coverage] ℹ️  已禁用 vite-istanbul-tracer (autoFix=false 或 disableTracer=true)')
    }

    // 返回插件数组或单个插件
    const result = plugins.length > 1 ? plugins : plugins[0]

    if (cb && typeof cb === 'function') {
      cb(null, result)
    }

    return result

  } catch (error) {
    console.error('[jt-coverage] 插件创建失败:', error.message)
    if (cb && typeof cb === 'function') {
      cb(error)
    }
    throw error
  }
}

/**
 * 向后兼容的增强版本 - 强制启用 autoFix
 */
async function createEnhancedCoveragePlugin(options = {}, cb) {
  // 增强版本强制启用 autoFix 和 debug
  return createCoveragePlugin({
    ...options,
    autoFix: true,  // 强制启用行号修正
    debug: options.debug !== false  // 默认启用调试
  }, cb)
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
