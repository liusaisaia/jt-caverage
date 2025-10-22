import { $confirm } from './native-confirm.js';
import { $message } from './native-message.js';
import { VideoPause, DataAnalysis } from './icons.js';
export { $confirm, $message, VideoPause, DataAnalysis };
export default { install(Vue){ Vue.prototype.$confirm = $confirm; Vue.prototype.$message = $message; Vue.component('VideoPause', VideoPause); Vue.component('DataAnalysis', DataAnalysis); Vue.$confirm = $confirm; Vue.$message = $message; } };
export function createNativeUI(){ return { $confirm, $message, VideoPause, DataAnalysis }; }