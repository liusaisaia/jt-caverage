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
 * Vue3（Vite）增强版插件：注入 define、开启 sourcemap 并集成 istanbul 覆盖率
 * @param {Object} options - 插件配置选项
 * @returns {Object} Vite插件实例
 */
function vitePluginCoverage(options = {}) {
  // 创建istanbul插件实例
  const istanbulPlugin = createIstanbulPlugin(options.istanbul);
  
  // 检查是否成功加载了istanbul插件
  const isIstanbulLoaded = istanbulPlugin.name !== 'istanbul-placeholder';
  
  return {
    name: 'jt-coverage-vue3',
    apply: ['build', 'serve'], // 同时支持构建和开发模式
    config(_config, _env) {
      const { json } = ensureGitInfo(options);
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
            reporter: ['text', 'json', 'html'],
            exclude: [
              'node_modules/**',
              'tests/**',
              '**/*.spec.{js,ts}',
              '**/*.test.{js,ts}'
            ]
          }
        }
      };
    },
    configResolved(resolvedConfig) {
      // 调用istanbul插件的configResolved钩子
      if (isIstanbulLoaded && istanbulPlugin.configResolved) {
        istanbulPlugin.configResolved(resolvedConfig);
      }
    },
    configureServer(server) {
      // 调用istanbul插件的configureServer钩子
      if (isIstanbulLoaded && istanbulPlugin.configureServer) {
        istanbulPlugin.configureServer(server);
      }
    },
    transform(code, id) {
      // 调用istanbul插件的transform钩子
      if (isIstanbulLoaded && istanbulPlugin.transform) {
        return istanbulPlugin.transform(code, id);
      }
      return null;
    },
    buildStart() {
      // 调用istanbul插件的buildStart钩子
      if (isIstanbulLoaded && istanbulPlugin.buildStart) {
        istanbulPlugin.buildStart();
      }
    },
    buildEnd() {
      // 调用istanbul插件的buildEnd钩子
      if (isIstanbulLoaded && istanbulPlugin.buildEnd) {
        istanbulPlugin.buildEnd();
      }
    },
    // 添加插件热更新处理
    handleHotUpdate(ctx) {
      if (isIstanbulLoaded && istanbulPlugin.handleHotUpdate) {
        return istanbulPlugin.handleHotUpdate(ctx);
      }
      return null;
    }
  };
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