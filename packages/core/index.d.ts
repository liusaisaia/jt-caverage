export declare function getGitInfo(): string;
export declare function handleProjectName(projectName: string): string;
export interface IstanbulOptions {
  coverageVariable?: string;
  extension?: string[];
  exclude?: string[];
}
export declare function getBabelConfig(options?: IstanbulOptions): [string, {
  coverageVariable: string;
  extension: string[];
  exclude: string[];
}];