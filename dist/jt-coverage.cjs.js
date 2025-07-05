"use strict";
const { execSync } = require("child_process");
const CoverageSourceMapTracePlugin = require("coverage-source-map-trace-plugin");
const path = require("path");
let cachedGitInfo = null;
const getGitInfo = () => {
  if (cachedGitInfo)
    return cachedGitInfo;
  const dayjs = require("dayjs");
  const commitHash = execSync("git rev-parse --short=8 HEAD").toString().trim();
  const fullCommitId = execSync("git rev-parse HEAD").toString().trim();
  const branch1 = execSync('git describe --contains --all HEAD 2>/dev/null || echo "unknown"').toString().trim().split("/").pop();
  const branch2 = execSync("git symbolic-ref --short HEAD 2>/dev/null || git name-rev --name-only HEAD").toString().trim().replace(/^origin\//, "").split("/").pop();
  const branchName = branch1.includes("unknown") ? branch2 : branch1;
  cachedGitInfo = `{
    "commit": "${commitHash}",
    "fullCommitId": "${fullCommitId}",
    "branchName": "${branchName}",
    "timestamp": "${dayjs().format("YYYY-MM-DD HH:mm:ss")}",
    "projectName": "${getProjectName()}",
    "coverageKey": "${handleProjectName(getProjectName())}"
  }`;
  return cachedGitInfo;
};
const getProjectName = () => {
  try {
    const topLevelPath = execSync("git rev-parse --show-toplevel", { stdio: "pipe" }).toString().trim();
    return path.basename(topLevelPath);
  } catch (error) {
    console.error("[jt-coverage] \u83B7\u53D6\u9879\u76EE\u540D\u79F0\u5931\u8D25:", error.message);
    return "\u672A\u77E5\u9879\u76EE";
  }
};
const getVueConfig = (config) => {
  config.plugin("coverage-source-map-trace-plugin").use(CoverageSourceMapTracePlugin).end().plugin("define").tap((args) => {
    args[0]["process.env"].GIT_BRANCH = JSON.stringify(cachedGitInfo);
    return args;
  });
  config.devtool("source-map");
  return config;
};
const getBabelConfig = (options = {}) => {
  return ["istanbul", {
    coverageVariable: options.coverageVariable || "__coverage__",
    extension: options.extension || [".js", ".vue", ".jsx", ".ts", ".tsx"],
    exclude: options.exclude || ["**/node_modules/**"]
  }];
};
const handleProjectName = (projectName) => {
  return projectName.replace(/-/g, "_");
};
const setupCoverage = (config, options = {}) => {
  if (!config) {
    throw new Error("[jt-coverage] config\u53C2\u6570\u4E0D\u80FD\u4E3A\u7A7A");
  }
  getGitInfo();
  if (options.coverageVariable) {
    cachedGitInfo.projectName = options.coverageVariable;
    cachedGitInfo.coverageKey = handleProjectName(options.coverageVariable);
  }
  getVueConfig(config);
  const babelConfig = getBabelConfig({ ...options, coverageVariable: cachedGitInfo.coverageKey });
  if (options.applyBabel !== false) {
    config.module.rule("js").use("babel-loader").tap((opts) => {
      if (!opts)
        opts = {};
      if (!opts.plugins)
        opts.plugins = [];
      opts.plugins.push(babelConfig);
      return opts;
    });
  }
  return config;
};
CoverageButton.install = function(Vue) {
  Vue.component(CoverageButton.name, CoverageButton);
};
module.exports = {
  getVueConfig,
  getBabelConfig,
  setupCoverage,
  cachedGitInfo,
  get CoverageButton() {
    const component = require("../lib/CoverageButton.vue").default;
    component.install = function(Vue) {
      Vue.component(component.name, component);
    };
    return component;
  }
};
//# sourceMappingURL=jt-coverage.cjs.js.map
