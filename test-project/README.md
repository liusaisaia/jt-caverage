# dev-coverage 测试项目

这是一个用于测试 dev-coverage 包的示例项目，帮助您验证覆盖率收集功能是否正常工作。

## 测试步骤

### 1. 准备 dev-coverage 包

首先，在 dev-coverage 包目录中执行以下命令，将包链接到全局：

```bash
cd c:\work\jmscb\npmTest
npm link
```

### 2. 安装测试项目依赖

在测试项目目录中安装所需依赖：

```bash
cd c:\work\jmscb\npmTest\test-project
npm install
```

### 3. 链接 dev-coverage 包

将全局链接的 dev-coverage 包链接到测试项目：

```bash
npm link dev-coverage
```

### 4. 运行测试

使用以下命令运行测试项目：

```bash
npm start
```

这将以开发环境模式运行项目，启用覆盖率收集功能。

## 测试内容说明

测试项目会执行以下操作：

1. 设置环境变量 `NODE_ENV=development`
2. 初始化手动保存功能 `setupManualSave()`
3. 启动覆盖率数据轮询 `startCoveragePolling(5000)`
4. 执行一个测试函数
5. 10秒后收集最终覆盖率数据 `collectFinalCoverage()`
6. 尝试手动触发一次保存 `window.saveCoverage()`

## 注意事项

- 确保已安装 `babel-plugin-istanbul` 和 `coverage-source-map-trace-plugin`
- 覆盖率数据将发送到 devCoverage.js 中配置的 API 端点
- 如果需要修改 API 端点，请编辑 dev-coverage 包中的 devCoverage.js 文件
- 在实际项目中，您需要根据项目类型（React、Vue 等）调整配置