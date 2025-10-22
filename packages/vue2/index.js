const { getGitInfo, getBabelConfig, handleProjectName } = require('@jt-coverage/core');
const CoverageSourceMapTracePlugin = require('coverage-source-map-trace-plugin');

let cachedGitInfo = null;

function ensureGitInfo(options = {}) {
  const raw = getGitInfo();
  const data = JSON.parse(raw);
  if (options.coverageVariable) {
    data.projectName = options.coverageVariable;
    data.coverageKey = handleProjectName(options.coverageVariable);
  }
  cachedGitInfo = JSON.stringify(data);
  return { data, json: cachedGitInfo };
}

function getVueConfig(config) {
  config
    .plugin('coverage-source-map-trace-plugin')
    .use(CoverageSourceMapTracePlugin)
    .end()
    .plugin('define')
    .tap(args => {
      args[0]['process.env'].GIT_BRANCH = JSON.stringify(cachedGitInfo);
      return args;
    });
  config.devtool('source-map');
  return config;
}

/**
 * 一站式配置 Vue2 + Babel 覆盖率
 */
function setupCoverage(config, options = {}) {
  if (!config) {
    throw new Error('[jt-coverage/vue2] config 参数不能为空');
  }
  const { data } = ensureGitInfo(options);

  // 注入 webpack-chain 配置
  getVueConfig(config);

  // 注入 babel-plugin-istanbul
  const babelTuple = getBabelConfig({ ...options, coverageVariable: data.coverageKey });
  if (options.applyBabel !== false) {
    config.module
      .rule('js')
      .use('babel-loader')
      .tap(opts => {
        opts = opts || {};
        opts.plugins = opts.plugins || [];
        opts.plugins.push(babelTuple);
        return opts;
      });
  }

  return config;
}

module.exports = {
  setupCoverage,
  getVueConfig,
  get cachedGitInfo() {
    return cachedGitInfo;
  },
  // UI（沿用根 lib 组件，按需可后续拆包）
  get CoverageButton() {
    const component = require('./lib/CoverageButton.vue').default;
    component.install = function(Vue) {
      Vue.component(component.name, component);
    };
    return component;
  },
  get NativeUI() {
    return require('./lib/native-ui.js').default;
  },
  get $confirm() {
    return require('./lib/native-confirm.js').$confirm;
  },
  get $message() {
    return require('./lib/native-message.js').$message;
  }
};