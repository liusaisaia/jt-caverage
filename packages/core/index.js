const { execSync } = require('child_process');
const path = require('path');

let _cachedGitInfo = null;

function safeExec(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (_) {
    return '';
  }
}

/**
 * 处理项目名称为 __project_name__ 形式
 */
function handleProjectName(projectName) {
  return `__${String(projectName || '').replace(/-/g, '_')}__`;
}

/**
 * 获取 Git 信息（JSON 字符串），带缓存
 * 包含: commit, fullCommitId, branchName, timestamp, projectName, coverageKey
 */
function getGitInfo() {
  if (_cachedGitInfo) return _cachedGitInfo;

  const dayjs = require('dayjs');

  // 仓库根与项目名
  const fullRepoPath = safeExec('git rev-parse --show-toplevel');
  const projectName = fullRepoPath ? path.basename(fullRepoPath) : path.basename(process.cwd());

  // 提交信息
  const commit = safeExec('git rev-parse --short=8 HEAD');
  const fullCommitId = safeExec('git rev-parse HEAD');

  // 分支名（兼容 Windows/PowerShell）
  let branchName = safeExec('git rev-parse --abbrev-ref HEAD');
  if (!branchName || branchName === 'HEAD') {
    const nameRev = safeExec('git name-rev --name-only HEAD');
    branchName = (nameRev || 'unknown').replace(/^origin\//, '').split('/').pop();
  }

  const info = {
    commit,
    fullCommitId,
    branchName,
    timestamp: require('dayjs')().format('YYYY-MM-DD HH:mm:ss'),
    projectName,
    coverageKey: handleProjectName(projectName)
  };

  _cachedGitInfo = JSON.stringify(info);
  return _cachedGitInfo;
}

/**
 * 返回 Istanbul 插件(babel-plugin-istanbul)配置元组
 */
function getBabelConfig(options = {}) {
  return ['istanbul', {
    coverageVariable: options.coverageVariable || '__coverage__',
    extension: options.extension || ['.js', '.vue', '.jsx', '.ts', '.tsx'],
    exclude: options.exclude || ['**/node_modules/**']
  }];
}

module.exports = {
  getGitInfo,
  getBabelConfig,
  handleProjectName
};