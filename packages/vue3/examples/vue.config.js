const { setupCoverageWebpack } = require('@jt-coverage/vue3');

module.exports = {
  transpileDependencies: true,
  configureWebpack: (config) => {
    return setupCoverageWebpack(config, {
      // 覆盖率变量名，用于区分不同项目的覆盖率数据
      coverageVariable: 'my-vue3-project',
      // 是否应用 babel-plugin-istanbul
      applyBabel: true
    });
  },
  // 其他 Vue CLI 配置...
};