export interface SetupOptions {
  coverageVariable?: string;
  extension?: string[];
  exclude?: string[];
  applyBabel?: boolean;
}
export declare function setupCoverage(config: any, options?: SetupOptions): any;
export declare function getVueConfig(config: any): any;

export declare const CoverageButton: any;
export declare const NativeUI: any;
export declare const $confirm: (...args: any[]) => any;
export declare const $message: (...args: any[]) => any;

export declare const cachedGitInfo: string | null;