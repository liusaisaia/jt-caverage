/**
 * 原生UI工具包 - 替代ElementUI的核心功能
 * 提供跨平台兼容的UI组件
 */

import { $confirm } from './native-confirm.js';
import { $message } from './native-message.js';
import { VideoPause, DataAnalysis } from './icons.js';

// 导出所有原生组件
export {
  $confirm,
  $message,
  VideoPause,
  DataAnalysis
};

/**
 * Vue插件安装函数
 * 用法：Vue.use(NativeUI)
 */
export default {
  install(Vue) {
    // 添加全局方法
    Vue.prototype.$confirm = $confirm;
    Vue.prototype.$message = $message;
    
    // 注册全局组件
    Vue.component('VideoPause', VideoPause);
    Vue.component('DataAnalysis', DataAnalysis);
    
    // 也作为全局函数提供
    Vue.$confirm = $confirm;
    Vue.$message = $message;
  }
};

/**
 * 快速创建原生UI实例
 * 用于非Vue环境
 */
export function createNativeUI() {
  return {
    $confirm,
    $message,
    VideoPause,
    DataAnalysis
  };
}