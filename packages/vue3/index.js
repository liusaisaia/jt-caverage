const { getGitInfo, getBabelConfig, handleProjectName } = require('@jt-coverage/core');

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

/**
 * 创建vite-plugin-istanbul插件实例
 * @param {Object} options - 插件配置选项
 * @returns {Object} Vite插件实例或空对象
 */
function createIstanbulPlugin(options = {}) {
  try {
    // 尝试动态导入vite-plugin-istanbul
    const istanbulPlugin = require('vite-plugin-istanbul');

    // 默认配置
    const defaultOptions = {
      include: ['src/**/*.{js,ts,vue}'],
      exclude: ['node_modules/**', 'tests/**', '**/*.spec.{js,ts}', '**/*.test.{js,ts}'],
      forceBuildInstrument: true,
      ...options
    };

    console.log('[jt-coverage/vue3] vite-plugin-istanbul loaded successfully with options:', defaultOptions);
    return istanbulPlugin(defaultOptions);
  } catch (error) {
    console.warn('[jt-coverage/vue3] vite-plugin-istanbul not found, coverage instrumentation disabled');
    console.error('[jt-coverage/vue3] Error details:', error.message);
    return {
      name: 'istanbul-placeholder',
      configResolved() {
        // 空实现，避免报错
      }
    };
  }
}

/**
 * Vue3（基于 Vue CLI 5/webpack-chain）适配
 */
function setupCoverageWebpack(config, options = {}) {
  if (!config) {
    throw new Error('[jt-coverage/vue3] config 参数不能为空');
  }
  const { data } = ensureGitInfo(options);

  // Define 插件注入 GIT_BRANCH
  config
    .plugin('define')
    .tap(args => {
      args[0]['process.env'].GIT_BRANCH = JSON.stringify(cachedGitInfo);
      return args;
    });

  // 开启 source-map
  config.devtool('source-map');

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

/**
 * Vue3（Vite）增强版插件：直接集成vite-plugin-istanbul
 * @param {Object} options - 插件配置选项
 * @returns {Object} Vite插件实例
 */
function vitePluginCoverage(options = {}) {
  // 合并默认配置
  const istanbulOptions = {
    include: ['src/**/*.{js,ts,vue}'],
    exclude: ['node_modules/**', 'tests/**', '**/*.spec.{js,ts}', '**/*.test.{js,ts}'],
    forceBuildInstrument: true,
    ...options.istanbul
  };

  // 尝试直接导入vite-plugin-istanbul
  let istanbulPlugin;
  let isIstanbulLoaded = false;

  try {
    // 尝试多种导入方式以兼容不同版本的vite-plugin-istanbul
    try {
      istanbulPlugin = require('vite-plugin-istanbul');
    } catch (e) {
      // 如果默认导入失败，尝试从dist目录导入
      istanbulPlugin = require('vite-plugin-istanbul/dist/index.js');
    }

    isIstanbulLoaded = true;
    console.log('[jt-coverage/vue3] vite-plugin-istanbul loaded successfully');
  } catch (error) {
    console.warn('[jt-coverage/vue3] vite-plugin-istanbul not found, coverage instrumentation disabled');
    console.error('[jt-coverage/vue3] Error details:', error.message);
    console.info('[jt-coverage/vue3] Please install vite-plugin-istanbul: npm install vite-plugin-istanbul --save-dev');
  }

  // 获取Git信息
  const { json } = ensureGitInfo(options);

  // 基础插件配置
  const basePlugin = {
    name: 'jt-coverage-vue3',
    apply: ['build', 'serve'], // 同时支持构建和开发模式
    config(_config, _env) {
      return {
        define: {
          'process.env': {
            GIT_BRANCH: json
          }
        },
        build: {
          sourcemap: true
        },
        // 添加测试覆盖率配置
        test: {
          coverage: {
            provider: 'istanbul',
            reporter: ['text', 'json', 'html'],
            exclude: [
              'node_modules/**',
              'tests/**',
              '**/*.spec.{js,ts}',
              '**/*.test.{js,ts}'
            ],
            ...options.coverage
          }
        }
      };
    }
  };

  // 如果成功加载了istanbul插件，则直接使用它
  if (isIstanbulLoaded) {
    // 创建istanbul插件实例
    const istanbulInstance = istanbulPlugin(istanbulOptions);

    // 返回合并后的插件，优先使用istanbul插件的方法
    return {
      ...basePlugin,
      ...istanbulInstance,
      // 确保我们的config方法不被覆盖
      config: basePlugin.config,
      // 如果istanbul插件有这些方法，则使用它们
      configResolved: istanbulInstance.configResolved || (() => {}),
      configureServer: istanbulInstance.configureServer || (() => {}),
      buildStart: istanbulInstance.buildStart || (() => {}),
      buildEnd: istanbulInstance.buildEnd || (() => {}),
      handleHotUpdate: istanbulInstance.handleHotUpdate || (() => {})
    };
  }

  // 如果没有加载istanbul插件，则返回基础插件
  return basePlugin;
}

module.exports = {
  setupCoverageWebpack,
  vitePluginCoverage,
  get CoverageButton() {
    const component = require('./lib/CoverageButton.vue').default;
    component.install = function(app) {
      // Vue3 注册方式
      app.component(component.name, component);
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
