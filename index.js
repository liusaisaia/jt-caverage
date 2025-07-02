/**
 * 封装引入插件
 */
const { execSync } = require('child_process');
const CoverageSourceMapTracePlugin = require('coverage-source-map-trace-plugin')

const dayjs = require('dayjs');
const commitHash = execSync('git rev-parse --short=8 HEAD').toString().trim()
const fullCommitId = execSync('git rev-parse HEAD').toString().trim();
const branch1 = execSync('git describe --contains --all HEAD 2>/dev/null || echo "unknown"').toString().trim().split('/').pop()
const branch2 = execSync('git symbolic-ref --short HEAD 2>/dev/null || git name-rev --name-only HEAD')
  .toString()
  .trim()
  .replace(/^origin\//, '').split('/').pop();
const branchName = branch1.includes('unknown') ? branch2 : branch1
const branch = `{
  "commit": "${commitHash}",
  "fullCommitId": "${fullCommitId}",
  "branchName": "${branchName}",
  "timestamp": "${dayjs().format('YYYY-MM-DD HH:mm:ss')}"
}`

const getVueConfig = (config) => {
  config
    .plugin('coverage-source-map-trace-plugin')
    .use(CoverageSourceMapTracePlugin)
    .end()
    .plugin('define')
    .tap(args => {
      args[0]['process.env'].GIT_BRANCH = JSON.stringify(branch)
      return args
    })
  config.devtool('source-map')
  return config
}

const getBabelConfig = (options = {}) => {
  return ['istanbul', {
    coverageVariable: options.coverageVariable || '__yl_jmsmy_sqs_im_front__',
    extension: options.extension || ['.js', '.vue']
  }]
}

module.exports = {
  getVueConfig,
  getBabelConfig
}
