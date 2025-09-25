/**
 * 原生UI组件使用示例
 * 展示如何替代ElementUI功能
 */

import Vue from 'vue';
import NativeUI from './native-ui.js';

// 安装原生UI插件
Vue.use(NativeUI);

// 示例1: 使用原生确认对话框
export function exampleConfirm() {
  // 替代 this.$confirm
  this.$confirm('确定要删除这条记录吗？', '删除确认', {
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消'
  }).then(() => {
    console.log('用户点击了确定');
    // 执行删除操作
  }).catch(() => {
    console.log('用户点击了取消');
  });
}

// 示例2: 使用原生消息提示
export function exampleMessage() {
  // 替代 this.$message
  this.$message.success('操作成功！');
  
  // 或者使用详细配置
  this.$message({
    message: '数据保存成功',
    type: 'success',
    duration: 3000,
    showClose: true
  });
}

// 示例3: 使用原生图标
export function exampleIcons() {
  // 在模板中使用
  return {
    template: `
      <div>
        <VideoPause size="16" color="#ff4d4f" />
        <DataAnalysis size="16" color="#52c41a" />
      </div>
    `
  };
}

// 示例4: 非Vue环境使用
export function exampleVanillaJS() {
  import { $confirm, $message } from './native-ui.js';
  
  // 使用确认对话框
  $confirm('确定要退出吗？', '退出确认').then(() => {
    window.close();
  });
  
  // 使用消息提示
  $message.error('网络连接失败');
}

// 示例5: 在CoverageButton中的实际应用
export function coverageButtonExample() {
  return {
    methods: {
      handleToggleCoverage() {
        this.$confirm(
          `是否${this.coverage ? '关闭覆盖率' : '开启任务并刷新页面'}?`,
          '提示',
          {
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          }
        ).then(() => {
          // 切换覆盖率状态
          this.coverage = !this.coverage;
          this.$message.success('设置已更新');
        }).catch(() => {
          this.$message.info('操作已取消');
        });
      }
    }
  };
}