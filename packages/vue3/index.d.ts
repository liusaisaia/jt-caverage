// 基础覆盖率配置选项
export interface SetupOptions {
  // 覆盖率变量名
  coverageVariable?: string;
  // 文件扩展名
  extension?: string[];
  // 排除模式
  exclude?: string[] | RegExp;
  // 包含模式
  include?: string[] | RegExp;
  // 是否应用Babel
  applyBabel?: boolean;
  // 是否需要环境变量
  requireEnv?: boolean;
  // 是否强制构建时插桩
  forceBuildInstrument?: boolean;
  // 是否启用调试模式
  debug?: boolean;
  // 是否自动修正SourceMap偏移
  autoFix?: boolean;
  // 是否需要SourceMap修正功能（为必选时）
  requireSourceMapFix?: boolean;
  // 是否启用SourceMap修正
  enableSourceMapFix?: boolean;
}

// Vite插件选项扩展
export interface ViteCoveragePluginOptions extends SetupOptions {
  // Istanbul特定选项
  istanbulOptions?: {
    // 插桩代码检测模式
    instrumentCodePattern?: RegExp;
    // 期望的行偏移量
    expectedLineOffset?: number;
    // 是否处理Vue SFC文件
    handleVueSFC?: boolean;
  };
}

// Quasar配置助手选项
export interface QuasarHelperOptions extends SetupOptions {
  // Quasar特定的项目名称
  coverageVariable?: string;
}

// Git信息接口
export interface GitInfo {
  projectName?: string;
  coverageKey?: string;
  branch?: string;
  commit?: string;
  author?: string;
  timestamp?: string;
  [key: string]: any;
}

// 主插件函数 - 智能选择实现类型
export declare function jtCoveragePlugin(options?: ViteCoveragePluginOptions): any | any[];

// 增强版插件函数 - 集成完整SourceMap修正功能
export declare function createEnhancedCoveragePlugin(
  options?: ViteCoveragePluginOptions,
  callback?: (error: Error | null, plugins?: any | any[]) => void
): Promise<any | any[]>;

// 基础插件函数 - 向后兼容版本
export declare function createCoveragePlugin(
  options?: SetupOptions,
  callback?: (error: Error | null, plugin?: any) => void
): Promise<any>;

// Quasar框架助手函数
export declare function createQuasarHelper(options?: QuasarHelperOptions): (config: any) => any;

// Git信息管理函数
export declare function ensureGitInfo(options?: SetupOptions): { data: GitInfo; json: string };

// 传统函数（向后兼容）
export declare function setupCoverageWebpack(config: any, options?: SetupOptions): any;
export declare function vitePluginCoverage(options?: SetupOptions): any;

// 组件和工具导出
export declare const CoverageButton: any;
export declare const NativeUI: any;
export declare const $confirm: (...args: any[]) => any;
export declare const $message: (...args: any[]) => any;
export declare const cachedGitInfo: string | null;

// Vue组件类型支持
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 支持直接导入 lib 目录下的组件
declare module '@jt-coverage/vue3/lib/CoverageButton.vue' {
  const component: any;
  export default component;
}

declare module '@jt-coverage/vue3/lib/native-ui.js' {
  const nativeUI: any;
  export default nativeUI;
}

declare module '@jt-coverage/vue3/lib/native-confirm.js' {
  const $confirm: any;
  export { $confirm };
}

declare module '@jt-coverage/vue3/lib/native-message.js' {
  const $message: any;
  export { $message };
}