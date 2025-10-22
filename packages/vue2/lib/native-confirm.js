import { NativeConfirm as CoreNativeConfirm } from './native-confirm-core.js';

/**
 * 全局确认函数 - 替代 this.$confirm
 */
export function $confirm(message, title = '提示', options = {}) {
  // 支持对象参数形式
  if (typeof message === 'object') {
    options = message;
    message = options.message || '';
    title = options.title || '提示';
  }
  const confirmOptions = { ...options, message, title };
  const instance = new CoreNativeConfirm(confirmOptions);
  return instance.show();
}

/**
 * Vue2 插件安装
 */
export default {
  install(Vue) {
    Vue.prototype.$confirm = $confirm;
    Vue.$confirm = $confirm;
  }
};