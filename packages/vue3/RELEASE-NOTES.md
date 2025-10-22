# @jt-coverage/vue3 发布说明

## 版本 0.0.5

### 发布日期
2023-09-26

### 更新内容
1. **修复缺失文件问题**：修复了 CoverageButton.vue 及相关依赖文件缺失的问题
2. **完善包结构**：确保所有必要的文件都包含在 lib 目录中
3. **改进导入体验**：现在可以正常使用以下导入方式：
   - `import CoverageButton from '@jt-coverage/vue3/lib/CoverageButton.vue'`
   - `import { CoverageButton } from '@jt-coverage/vue3'`
4. **修复 devCoverage.js 问题**：修复了 devCoverage.js 文件内容缺失的问题
5. **修复函数导入错误**：修复了 collectFinalCoverage 函数导入错误的问题

### 包含文件
- index.js - 包入口文件
- index.d.ts - TypeScript 类型定义
- lib/CoverageButton.vue - 覆盖率按钮组件
- lib/icons.js - 图标相关
- lib/native-confirm.js - 原生确认对话框
- lib/native-message.js - 原生消息提示
- lib/native-ui.js - 原生UI组件
- lib/devCoverage.js - 开发覆盖率工具
- lib/native-confirm-core.js - 确认对话框核心功能

### 使用方法

#### 直接导入
```javascript
import CoverageButton from '@jt-coverage/vue3/lib/CoverageButton.vue';
```

#### 从包入口点导入
```javascript
import { CoverageButton } from '@jt-coverage/vue3';
```

#### 动态导入
```javascript
const CoverageButton = await import('@jt-coverage/vue3/lib/CoverageButton.vue');
```

### 依赖关系
- @jt-coverage/core: 0.0.1
- Vue: ^3.0.0 (可选)
- dayjs: >=1.7.0 (可选)
- vite: >=2.0.0 (可选)

### 发布信息
- 注册表地址: https://maven.jtexpress.com.cn/nexus3/repository/npm-hosted-2/
- 访问权限: 公开
- 包大小: 9.2 kB (压缩后)
- 解压大小: 35.2 kB

### 安装命令
```bash
npm install @jt-coverage/vue3@0.0.4
```

### 注意事项
1. 此版本修复了之前版本中文件缺失的问题
2. 现在支持在 Vue 3 项目中正常导入和使用 CoverageButton 组件
3. 如果遇到导入问题，请参考示例文件中的不同导入方式

### 相关链接
- 仓库地址: https://maven.jtexpress.com.cn/nexus3/repository/npm-hosted-2/
- 包地址: https://maven.jtexpress.com.cn/nexus3/repository/npm-hosted-2/@jt-coverage/vue3