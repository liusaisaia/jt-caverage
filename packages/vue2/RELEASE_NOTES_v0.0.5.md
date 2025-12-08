# Release Notes v0.0.5

## 版本概览

**版本号**: v0.0.5  
**发布日期**: 2025-01-19  
**类型**: 补丁版本  
**包名**: @jt-coverage/vue2

## 🎯 主要更新

### 代码优化
- ✅ 与核心库 `@jt-coverage/core@0.0.1` 版本对齐
- ✅ 依赖关系优化，减少版本冲突
- ✅ 保持向后兼容性

### 技术改进
- ✅ 统一依赖管理策略
- ✅ 代码结构优化，提升可维护性
- ✅ 保持 webpack-chain 配置最佳实践

## 📋 技术详情

### 依赖更新
- `@jt-coverage/core`: `0.0.1` (保持不变)
- `coverage-source-map-trace-plugin`: `^1.0.0` (保持不变)

### 功能特性
- **Vue2 适配**: 完美支持 Vue2 + webpack-chain
- **Babel 集成**: 自动注入 babel-plugin-istanbul
- **Coverage 按钮**: UI 组件支持
- **本地工具**: 完整的数据工具链

## 🔧 升级指南

### 安装命令
```bash
# 安装特定版本
npm install @jt-coverage/vue2@0.0.5

# 或安装最新版本
npm install @jt-coverage/vue2@latest
```

### Vite 配置示例
```javascript
// vite.config.js
const { setupCoverage } = require('@jt-coverage/vue2');

module.exports = {
  plugins: [
    // 其他插件
  ],
  chainWebpack(config) {
    setupCoverage(config, {
      coverageVariable: 'COVERAGE',
      applyBabel: true
    });
  }
};
```

## ✅ 测试验证

- ✅ 语法检查通过
- ✅ 依赖关系验证
- ✅ 向后兼容性确认
- ✅ 构建测试通过

## 🔗 相关链接

- [GitHub 仓库](https://github.com/your-org/jt-coverage)
- [文档中心](https://coverage-docs.your-org.com)
- [问题反馈](https://github.com/your-org/jt-coverage/issues)

---

**快速升级**:
```bash
npm update @jt-coverage/vue2@0.0.5
```