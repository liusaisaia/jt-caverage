/**
 * 原生消息提示组件 - 替代ElementUI的$message
 */
import { successIcon, errorIcon, confirmIcon } from './icons.js';
class NativeMessage { /* 内容与根 lib/native-message.js 相同，略 */ }
export function $message(message, options = {}) {
  if (typeof message === 'object') { options = message; message = options.message || ''; } else { options.message = message; }
  const nativeMessage = new NativeMessage(options); return nativeMessage.show();
}
$message.success = (m,o={}) => $message(m,{...o,type:'success'});
$message.error = (m,o={}) => $message(m,{...o,type:'error'});
$message.warning = (m,o={}) => $message(m,{...o,type:'warning'});
$message.info = (m,o={}) => $message(m,{...o,type:'info'});
export default { install(Vue){ Vue.prototype.$message = $message; Vue.$message = $message; } };