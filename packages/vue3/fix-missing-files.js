/**
 * 修复@jt-coverage/vue3包中缺失CoverageButton.vue文件的问题
 * 
 * 问题描述：
 * @jt-coverage/vue3包的index.js中通过getter动态导入'./lib/CoverageButton.vue'，
 * 但实际上packages/vue3/lib目录中没有这个文件，导致导入失败。
 * 
 * 解决方案：
 * 1. 将根目录lib/CoverageButton.vue复制到packages/vue3/lib目录
 * 2. 更新@jt-coverage/vue3包的构建脚本，确保文件被正确包含
 */

const fs = require('fs');
const path = require('path');

// 源文件路径
const sourcePath = path.resolve(__dirname, '../../lib/CoverageButton.vue');
// 目标路径
const targetPath = path.resolve(__dirname, './lib/CoverageButton.vue');

// 确保目标目录存在
const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 复制文件
if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, targetPath);
  console.log('✅ CoverageButton.vue 已成功复制到 packages/vue3/lib/');
} else {
  console.error('❌ 源文件不存在:', sourcePath);
}

// 同时复制其他必要的文件
const otherFiles = [
  '../../lib/icons.js',
  '../../lib/native-ui.js',
  '../../lib/native-confirm.js',
  '../../lib/native-message.js'
];

otherFiles.forEach(file => {
  const sourceFile = path.resolve(__dirname, file);
  const targetFile = path.resolve(__dirname, './lib/', path.basename(file));
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✅ ${path.basename(file)} 已成功复制到 packages/vue3/lib/`);
  } else {
    console.error(`❌ 源文件不存在: ${sourceFile}`);
  }
});

console.log('\n修复完成！现在可以正常导入 @jt-coverage/vue3/lib/CoverageButton.vue');