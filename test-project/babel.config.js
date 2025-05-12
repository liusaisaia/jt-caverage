// 测试项目的babel配置文件
const { getBabelConfig } = require('dev-coverage');

module.exports = getBabelConfig({
  // 自定义istanbul插件选项
  istanbulOptions: {
    exclude: [
      "**/*.spec.js",
      "**/*.test.js",
      "**/node_modules/**"
    ]
  },
  // 添加其他babel预设
  presets: ['@babel/preset-env'],
  // 添加其他babel插件
  plugins: []
});