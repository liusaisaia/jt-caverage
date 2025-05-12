# dev-coverage

一个用于收集和报告JavaScript应用程序代码覆盖率的工具包。

## 安装

```bash
npm install jt-coverage --save-dev
```

## 依赖

本包需要以下依赖：

```bash
npm install babel-plugin-istanbul --save-dev
```

## 配置

### Babel配置

你可以使用我们提供的`getBabelConfig`函数来自动配置`babel-plugin-istanbul`，无需手动添加条件判断代码：

```javascript
// babel.config.js
const { getBabelConfig } = require('jt-coverage');

module.exports = getBabelConfig({
  // 可选：自定义istanbul插件选项
  istanbulOptions: {
    exclude: [
      "**/*.spec.js",
      "**/*.test.js"
    ]
  },
  // 可选：自定义需要启用istanbul的环境列表，默认为['development', 'test', 'uat']
  environments: ['development', 'test', 'uat'],
  // 可选：添加其他babel预设
  presets: ['@babel/preset-env'],
  // 可选：添加其他babel插件
  plugins: []
});
```

这个函数会自动根据当前环境变量`NODE_ENV`判断是否添加istanbul插件，你不再需要手动编写条件判断代码。

如果你仍然想手动配置，可以在你的`.babelrc`或`babel.config.js`中配置`babel-plugin-istanbul`：

```json
{
  "env": {
    "development": {
      "plugins": [
        ["istanbul", {
          "exclude": [
            "**/*.spec.js",
            "**/*.test.js"
          ]
        }]
      ]
    },
    "test": {
      "plugins": [
        ["istanbul"]
      ]
    },
    "uat": {
      "plugins": [
        ["istanbul"]
      ]
    }
  }
}
```

## 使用方法

### 覆盖率收集

```javascript
import { setupManualSave, startCoveragePolling, stopCoveragePolling, collectFinalCoverage } from 'jt-coverage';

// 在应用程序入口文件中初始化
setupManualSave(); // 设置window.saveCoverage()函数用于手动保存覆盖率数据

// 开始定期收集覆盖率数据（可选）
startCoveragePolling(10000); // 每10秒收集一次

// 在应用程序卸载或关闭前收集最终覆盖率数据
// 例如在React应用的useEffect中：
// useEffect(() => {
//   return () => {
//     collectFinalCoverage();
//   };
// }, []);

// 如果需要，可以手动停止轮询
// stopCoveragePolling();
```

### Webpack配置

你可以使用我们提供的`getWebpackConfig`函数来配置Webpack，自动添加覆盖率源码映射追踪插件：

```javascript
// vue.config.js 或 webpack配置文件
const { getWebpackConfig } = require('jt-coverage');

module.exports = {
  ...getWebpackConfig({
    // 可选：传递给CoverageSourceMapTracePlugin的选项
    pluginOptions: {
      // 插件配置选项
    }
  })
};
```

## API

### 覆盖率收集API

#### setupManualSave()

设置全局函数`window.saveCoverage()`，允许用户手动将覆盖率数据保存为JSON文件。

#### startCoveragePolling(intervalMilliseconds = 5000)

开始定期收集覆盖率数据。

- `intervalMilliseconds`: 收集间隔，默认为5000毫秒（5秒）。

#### stopCoveragePolling()

停止定期收集覆盖率数据。

#### collectFinalCoverage()

收集并发送最终的覆盖率数据到指定的API端点。

### 配置API

#### getBabelConfig(options = {})

生成自动添加istanbul插件的Babel配置。

- `options.istanbulOptions`: 传递给istanbul插件的选项，默认包含排除测试文件的配置。
- `options.environments`: 需要启用istanbul的环境列表，默认为`['development', 'test', 'uat']`。
- `options.presets`: 其他需要添加的Babel预设数组。
- `options.plugins`: 其他需要添加的Babel插件数组。

#### getWebpackConfig(options = {})

生成包含覆盖率源码映射追踪插件的Webpack配置。

- `options.pluginOptions`: 传递给CoverageSourceMapTracePlugin的选项。

## 注意事项

- 本工具仅在开发环境（development、test、uat）中启用。
- 确保应用程序中正确配置了babel-plugin-istanbul。
- 覆盖率数据将发送到配置的API端点，可以根据需要修改devCoverage.js中的端点URL。