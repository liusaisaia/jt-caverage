// 本地测试示例文件

// 1. 首先，使用npm link将本地包链接到全局
// 在当前目录执行: npm link

// 2. 然后在测试项目中使用这个包
// 在测试项目目录执行: npm link dev-coverage

// 3. 在测试项目中创建babel配置文件 (babel.config.js)
const { getBabelConfig } = require('dev-coverage');

module.exports = getBabelConfig({
  // 自定义istanbul插件选项
  istanbulOptions: {
    exclude: [
      "**/*.spec.js",
      "**/*.test.js"
    ]
  },
  // 添加其他babel预设
  presets: ['@babel/preset-env'],
  // 添加其他babel插件
  plugins: []
});

// 4. 在测试项目中创建webpack配置文件 (如果使用webpack)
const { getWebpackConfig } = require('dev-coverage');

module.exports = {
  ...getWebpackConfig({
    // 可选：传递给CoverageSourceMapTracePlugin的选项
    pluginOptions: {}
  })
};

// 5. 在测试项目的入口文件中使用覆盖率收集功能
import { setupManualSave, startCoveragePolling, collectFinalCoverage } from 'dev-coverage';

// 设置环境变量以启用覆盖率收集
// 可以在启动命令中设置: NODE_ENV=development npm start
// 或者在代码中设置: process.env.NODE_ENV = 'development';

// 初始化手动保存功能
setupManualSave();

// 开始定期收集覆盖率数据（可选）
startCoveragePolling(10000); // 每10秒收集一次

// 在应用程序卸载或关闭前收集最终覆盖率数据
// 例如在React应用的useEffect中：
// useEffect(() => {
//   return () => {
//     collectFinalCoverage();
//   };
// }, []);

// 6. 测试注意事项：
// - 确保已安装babel-plugin-istanbul: npm install babel-plugin-istanbul --save-dev
// - 确保已安装coverage-source-map-trace-plugin: npm install coverage-source-map-trace-plugin --save-dev
// - 确保NODE_ENV设置为development、test或uat中的一个
// - 在浏览器控制台中可以通过window.saveCoverage()手动保存覆盖率数据
// - 覆盖率数据将发送到配置的API端点，可以在devCoverage.js中修改端点URL