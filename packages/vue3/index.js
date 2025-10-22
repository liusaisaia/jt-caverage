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
      // 尝试标准require导入
      istanbulPlugin = require('vite-plugin-istanbul');
      console.log('[jt-coverage/vue3] Loaded vite-plugin-istanbul via standard require');
    } catch (e) {
      console.log('[jt-coverage/vue3] Standard require failed, trying alternative methods');
      
      // 如果默认导入失败，尝试从dist目录导入
      try {
        istanbulPlugin = require('vite-plugin-istanbul/dist/index.js');
        console.log('[jt-coverage/vue3] Loaded vite-plugin-istanbul via dist/index.js');
      } catch (e2) {
        console.log('[jt-coverage/vue3] dist/index.js failed, trying ESM import');
        
        // 对于7.x版本，尝试ESM导入方式
        try {
          // 尝试使用动态import
          const modulePath = require.resolve('vite-plugin-istanbul');
          const fs = require('fs');
          const packagePath = require.resolve('vite-plugin-istanbul/package.json');
          const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          
          // 检查package.json中的exports或main字段
          const entryPoint = packageJson.exports?.['.']?.import || 
                           packageJson.exports?.['.']?.require || 
                           packageJson.module || 
                           packageJson.main;
          
          if (entryPoint) {
            const fullPath = require.resolve('vite-plugin-istanbul/' + entryPoint);
            delete require.cache[fullPath];
            istanbulPlugin = require(fullPath);
            console.log('[jt-coverage/vue3] Loaded vite-plugin-istanbul via package.json entry point:', entryPoint);
          } else {
            throw new Error('No entry point found in package.json');
          }
        } catch (e3) {
          console.log('[jt-coverage/vue3] ESM import failed, trying direct module resolution');
          
          // 最后尝试直接解析模块
          try {
            const modulePath = require.resolve('vite-plugin-istanbul');
            delete require.cache[modulePath];
            const istanbulModule = require(modulePath);
            istanbulPlugin = istanbulModule.default || istanbulModule;
            console.log('[jt-coverage/vue3] Loaded vite-plugin-istanbul via direct module resolution');
          } catch (e4) {
            throw new Error(`Failed to import vite-plugin-istanbul with all available methods. Last error: ${e4.message}`);
          }
        }
      }
    }

    // 验证插件是否为函数
    if (typeof istanbulPlugin !== 'function') {
      throw new Error('vite-plugin-istanbul is not a function');
    }

    isIstanbulLoaded = true;
    console.log('[jt-coverage/vue3] vite-plugin-istanbul loaded successfully');
  } catch (error) {
    console.warn('[jt-coverage/vue3] vite-plugin-istanbul not found, coverage instrumentation disabled');
    console.error('[jt-coverage/vue3] Error details:', error.message);
    console.info('[jt-coverage/vue3] Please install vite-plugin-istanbul: npm install vite-plugin-istanbul --save-dev');
    console.info('[jt-coverage/vue3] Supported versions: ^3.0.0, ^4.0.0, ^7.0.0');
    console.info('[jt-coverage/vue3] If you are using version 7.x, try adding this to your vite.config.ts:');
    console.info('[jt-coverage/vue3]   optimizeDeps: { exclude: [\'vite-plugin-istanbul\'] }');
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
