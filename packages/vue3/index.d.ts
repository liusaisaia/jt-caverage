export interface SetupOptions {
  coverageVariable?: string;
  extension?: string[];
  exclude?: string[];
  applyBabel?: boolean;
  requireEnv?: boolean;
  forceBuildInstrument?: boolean;
}

export declare function createCoveragePlugin(options?: SetupOptions): any;
export declare function setupCoverageWebpack(config: any, options?: SetupOptions): any;
export declare function vitePluginCoverage(options?: SetupOptions): any;
export declare function ensureGitInfo(options?: SetupOptions): { data: any; json: string };
export declare function getCachedGitInfoString(): string;

export declare const CoverageButton: any;
export declare const NativeUI: any;
export declare const $confirm: (...args: any[]) => any;
export declare const $message: (...args: any[]) => any;
export declare const cachedGitInfo: string | null;

// 支持直接导入 lib 目录下的组件
declare module '@jt-coverage/vue3/lib/CoverageButton.vue' {
  const component: any;
  export default component;
}