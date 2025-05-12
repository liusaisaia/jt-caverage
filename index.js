// 入口文件 - CommonJS版本
const devCoverage = require('./devCoverage.js.cjs');
const webpackConfig = require('./webpack-config');

// 导出所有函数
module.exports = {
  // 从devCoverage.js.cjs导出
  setupManualSave: devCoverage.setupManualSave,
  startCoveragePolling: devCoverage.startCoveragePolling,
  stopCoveragePolling: devCoverage.stopCoveragePolling,
  collectFinalCoverage: devCoverage.collectFinalCoverage,
  
  // 从webpack-config导出
  getWebpackConfig: webpackConfig.getWebpackConfig,
  getBabelConfig: webpackConfig.getBabelConfig,
  CoverageSourceMapTracePlugin: webpackConfig.CoverageSourceMapTracePlugin
};