// 测试项目入口文件

// 注意：在运行此文件前，请先执行以下步骤：
// 1. 在dev-coverage包目录执行: npm link
// 2. 在当前目录执行: npm install
// 3. 在当前目录执行: npm link dev-coverage

// 模拟浏览器环境（仅用于演示）
global.window = {};
global.document = {
  createElement: () => ({
    href: '',
    download: '',
    click: () => {},
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};
global.URL = {
  createObjectURL: () => 'blob:url',
  revokeObjectURL: () => {}
};
global.Blob = function(content, options) {
  this.content = content;
  this.options = options;
};

// 设置环境变量（如果未通过cross-env设置）
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// 导入dev-coverage包
const { setupManualSave, startCoveragePolling, collectFinalCoverage } = require('dev-coverage');

console.log(`当前NODE_ENV环境: ${process.env.NODE_ENV}`);

// 初始化手动保存功能
setupManualSave();
console.log('已设置手动保存功能，可以通过window.saveCoverage()保存覆盖率数据');

// 开始定期收集覆盖率数据
startCoveragePolling(5000); // 每5秒收集一次
console.log('已启动覆盖率数据轮询，每5秒收集一次');

// 模拟一些代码执行
function testFunction() {
  console.log('测试函数被执行');
  return 'test result';
}

testFunction();

// 模拟应用程序运行一段时间
setTimeout(() => {
  console.log('模拟应用程序即将关闭...');
  
  // 收集最终覆盖率数据
  collectFinalCoverage();
  console.log('已收集最终覆盖率数据');
  
  // 手动触发一次保存
  if (typeof window.saveCoverage === 'function') {
    window.saveCoverage();
  }
  
  console.log('测试完成！');
}, 10000); // 10秒后结束