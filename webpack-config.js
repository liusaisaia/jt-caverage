// 在您的包中添加一个配置生成器文件 webpack-config.js
const CoverageSourceMapTracePlugin = require("./coverage-source-map-trace-plugin");

function getWebpackConfig(options = {}) {
  return {
    configureWebpack: {
      plugins: [new CoverageSourceMapTracePlugin(options.pluginOptions || {})],
      devtool: "source-map", // 或其他适合的 sourcemap 配置
    },
  };
}

/**
 * 获取Babel配置，自动根据环境变量添加istanbul插件
 * @param {Object} options - 配置选项
 * @param {Object} options.istanbulOptions - 传递给istanbul插件的选项
 * @param {Array<string>} options.environments - 需要启用istanbul的环境列表，默认为['development', 'test', 'uat']
 * @returns {Object} Babel配置对象
 */
function getBabelConfig(options = {}) {
  const environments = options.environments || ['development', 'test', 'uat'];
  const istanbulOptions = options.istanbulOptions || {
    exclude: [
      "**/*.spec.js",
      "**/*.test.js"
    ]
  };
  
  // 创建基础配置
  const config = {
    presets: options.presets || [],
    plugins: options.plugins || []
  };
  
  // 根据环境变量自动添加istanbul插件
  if (environments.includes(process.env.NODE_ENV)) {
    config.plugins.push(['istanbul', istanbulOptions]);
  }
  
  return config;
}

module.exports = {
  getWebpackConfig,
  getBabelConfig,
  CoverageSourceMapTracePlugin,
};
