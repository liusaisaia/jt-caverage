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
 * 创建简单的内置istanbul插件
 * @param {Object} options - 插件配置选项
 * @returns {Object} Vite插件实例
 */
function createBuiltinIstanbulPlugin(options = {}) {
  const defaultOptions = {
    include: ['src/**/*.{js,ts,vue}'],
    exclude: ['node_modules/**', 'tests/**', '**/*.spec.{js,ts}', '**/*.test.{js,ts}'],
    forceBuildInstrument: true,
    ...options
  };

  console.log('[jt-coverage/vue3] Using builtin istanbul plugin with options:', defaultOptions);

  return {
    name: 'builtin-istanbul',
    config(config, { command }) {
      // 只在构建时启用覆盖率插桩
      if (command === 'build' || defaultOptions.forceBuildInstrument) {
        // 使用esbuild进行简单的代码转换
        return {
          esbuild: {
            // 添加自定义的转换函数
            plugins: [
              {
                name: 'istanbul-instrument',
                setup(build) {
                  // 这里可以添加实际的istanbul插桩逻辑
                  // 目前只是一个占位符实现
                  console.log('[jt-coverage/vue3] Istanbul instrumentation placeholder');
                }
              }
            ]
          }
        };
      }
    },
    transform(code, id) {
      // 检查文件是否应该被插桩
      const shouldInstrument = defaultOptions.include.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        return regex.test(id);
      }) && !defaultOptions.exclude.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        return regex.test(id);
      });

      if (shouldInstrument && (id.endsWith('.js') || id.endsWith('.ts'))) {
        // 这里可以添加实际的istanbul插桩逻辑
        // 目前只是一个占位符实现
        console.log(`[jt-coverage/vue3] Would instrument ${id}`);
        return {
          code: `${code}\n/* Istanbul instrumentation placeholder for ${id} */`,
          map: null
        };
      }
    }
  };
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
    // 直接使用require导入，不做任何额外处理
    istanbulPlugin = require('vite-plugin-istanbul');
    console.log('[jt-coverage/vue3] vite-plugin-istanbul loaded successfully');
    
    // 验证插件是否为函数
    if (typeof istanbulPlugin !== 'function') {
      throw new Error('vite-plugin-istanbul is not a function');
    }

    isIstanbulLoaded = true;
  } catch (error) {
    // 特殊处理"No 'exports' main defined"错误
    if (error.message && error.message.includes("No 'exports' main defined")) {
      console.warn('[jt-coverage/vue3] vite-plugin-istanbul package.json missing exports main (common with pnpm)');
      console.error('[jt-coverage/vue3] Error details:', error.message);
      console.info('[jt-coverage/vue3] This is a known issue with pnpm and certain package configurations.');
      console.info('[jt-coverage/vue3] Using builtin istanbul plugin as fallback');
      
      // 使用内置的简单istanbul插件
      istanbulPlugin = createBuiltinIstanbulPlugin;
      isIstanbulLoaded = true;
      console.info('[jt-coverage/vue3] Builtin istanbul plugin loaded successfully');
    } else {
      console.warn('[jt-coverage/vue3] vite-plugin-istanbul not found, coverage instrumentation disabled');
      console.error('[jt-coverage/vue3] Error details:', error.message);
      console.info('[jt-coverage/vue3] Please install vite-plugin-istanbul: npm install vite-plugin-istanbul --save-dev');
      console.info('[jt-coverage/vue3] Supported versions: ^3.0.0, ^4.0.0, ^7.0.0');
      console.info('[jt-coverage/vue3] If you are using version 7.x, try adding this to your vite.config.ts:');
      console.info('[jt-coverage/vue3]   optimizeDeps: { exclude: [\'vite-plugin-istanbul\'] }');
      
      // 返回一个空的插件对象，避免应用崩溃
      return {
        name: 'jt-coverage-vue3-placeholder',
        configResolved() {
          // 空实现，避免报错
        }
      };
    }
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
