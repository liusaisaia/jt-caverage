// 修改为从 dist 目录导入
/**
 * 封装引入插件
 */
const { execSync } = require('child_process')
const CoverageSourceMapTracePlugin = require('coverage-source-map-trace-plugin')
const path = require('path')
let cachedGitInfo = null

/**
 * 获取Git提交信息
 * @returns {string} 包含提交信息的JSON字符串，包含commit、fullCommitId、branchName和timestamp字段
 * * 获取完整提交ID
 * 获取分支名称（两种方式获取）
 * 组合信息并缓存结果
 */
const getGitInfo = () => {
  if (cachedGitInfo) return cachedGitInfo
  const fullRepoPath = execSync("git rev-parse --show-toplevel", { stdio: "pipe" }).toString().trim();
  const projectName = path.basename(fullRepoPath);
  const dayjs = require('dayjs')
  const commitHash = execSync('git rev-parse --short=8 HEAD').toString().trim()
  const fullCommitId = execSync('git rev-parse HEAD').toString().trim()
  const branch1 = execSync('git describe --contains --all HEAD 2>/dev/null || echo "unknown"').toString().trim().split('/').pop()
  const branch2 = execSync('git symbolic-ref --short HEAD 2>/dev/null || git name-rev --name-only HEAD')
    .toString()
    .trim()
    .replace(/^origin\//, '').split('/').pop()
  const branchName = branch1.includes('unknown') ? branch2 : branch1
  cachedGitInfo = `{
    "commit": "${commitHash}",
    "fullCommitId": "${fullCommitId}",
    "branchName": "${branchName}",
    "timestamp": "${dayjs().format('YYYY-MM-DD HH:mm:ss')}",
    "projectName": "${projectName}",
    "coverageKey": "${handleProjectName(projectName)}"
  }`

  return cachedGitInfo
}

const getVueConfig = (config) => {
  config
    .plugin('coverage-source-map-trace-plugin')
    .use(CoverageSourceMapTracePlugin)
    .end()
    .plugin('define')
    .tap(args => {
      args[0]['process.env'].GIT_BRANCH = JSON.stringify(cachedGitInfo)
      return args
    })
  config.devtool('source-map')
  return config
}

const getBabelConfig = (options = {}) => {
  return ['istanbul', {
    coverageVariable: options.coverageVariable || '__coverage__', // 提供默认值
    extension: options.extension || ['.js', '.vue', '.jsx', '.ts', '.tsx'], // 扩展更多文件类型
    exclude: options.exclude || ['**/node_modules/**'] // 添加排除选项
  }]
}

/**
 * 处理项目名称
 */
const handleProjectName = (projectName) => {
  return `__${projectName.replace(/-/g, "_")}__`;
}

/**
 * 一站式配置Vue和Babel的覆盖率
 * @param {Object} config - Vue配置对象
 * @param {Object} options - 配置选项
 * @param {string} options.coverageVariable - 覆盖率变量名
 * @param {Array} options.extension - 文件扩展名数组
 * @param {boolean} options.applyBabel - 是否自动应用Babel配置，默认为true
 * @returns {Object} config - 配置完成的config对象
 */
const setupCoverage = (config, options = {}) => {
  if (!config) {
    throw new Error('[jt-coverage] config参数不能为空')
  }
  getGitInfo()
  const cachedGitInfoData = JSON.parse(cachedGitInfo);
  if (options.coverageVariable) {
    cachedGitInfoData.projectName = options.coverageVariable;
    cachedGitInfoData.coverageKey = handleProjectName(options.coverageVariable);
  }
  cachedGitInfo = JSON.stringify(cachedGitInfoData);
  // 应用Vue配置
  getVueConfig(config)


  // 获取Babel配置
  const babelConfig = getBabelConfig({ ...options, coverageVariable: cachedGitInfoData.coverageKey  })
  // - 替换_

  // 如果选项中指定了自动应用Babel配置（默认为true）
  if (options.applyBabel !== false) {
    // 直接应用Babel配置到config对象
    config.module
      .rule('js')
      .use('babel-loader')
      .tap(opts => {
        // 确保plugins数组存在
        if (!opts) opts = {}
        if (!opts.plugins) opts.plugins = []

        // 添加istanbul插件
        opts.plugins.push(babelConfig)

        return opts
      })
  }

  return config
}

module.exports = {
  getVueConfig,
  getBabelConfig,
  setupCoverage,
  cachedGitInfo,
  /**
   * 使用 getter 来延迟加载 Vue 组件。
   * 这样在 Node.js 环境中 (如 vue.config.js) 就不会立即 require('.vue') 文件，
   * 只有在浏览器端代码真正使用 CoverageButton 时才会加载它。
   */
  get CoverageButton() {
    const component = require('../lib/CoverageButton.vue').default
    // 动态为组件添加 install 方法，使其可以作为插件使用 (Vue.use)
    component.install = function(Vue) {
      Vue.component(component.name, component)
    }
    return component
  }
}
