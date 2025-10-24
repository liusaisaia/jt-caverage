const { getGitInfo, handleProjectName } = require('@jt-coverage/core')

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
 * 创建vue3 覆盖插件包装 - 简化版，只使用 Istanbul
 * 从外部项目的 node_modules 中加载 vite-plugin-istanbul
 */
async function createCoveragePlugin(options = {}) {
  ensureGitInfo(options)
  let istanbulPlugin

  try {
    // 使用动态导入来支持 ES 模块
    const module = await import('vite-plugin-istanbul')
    istanbulPlugin = module.default || module
  } catch (error) {
    console.warn('[jt-coverage] 无法加载 vite-plugin-istanbul:', error.message)
    throw error
  }

  // 确保我们拿到的是函数
  const istanbul = typeof istanbulPlugin === 'function' ? istanbulPlugin : istanbulPlugin.default

  if (typeof istanbul !== 'function') {
    throw new Error('vite-plugin-istanbul 导出格式不兼容，请检查版本。期望导出函数，实际得到: ' + typeof istanbul)
  }

  return istanbul({
    ...options,
    requireEnv: false,
    forceBuildInstrument: true
  })
}

module.exports = {
  ensureGitInfo,
  createCoveragePlugin,
  get CoverageButton() {
    const component = require('./lib/CoverageButton.vue').default
    component.install = function (app) {
      // Vue3 注册方式
      app.component(component.name, component)
    }
    return component
  },
  get NativeUI() {
    return require('./lib/native-ui.js').default
  },
  get $confirm() {
    return require('./lib/native-confirm.js').$confirm
  },
  get $message() {
    return require('./lib/native-message.js').$message
  }
}
