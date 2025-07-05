// CommonJS版本的devCoverage.js

// 定时器 ID
let coverageLogIntervalId = null;
let currentCoverageKey = '__coverage__'; // 默认的覆盖率数据字段名
// gitlab token
let gitlab_token = ''
// 项目名称
// app_name
let app_name = ''
// app_Id
const app_id = ''
// 国家
let country_name = ''
// 分支信息
let branch_detail = {}

/**
 * 启动覆盖率数据的定期轮询日志
 * @param {number} intervalMilliseconds - 轮询间隔（毫秒）
 */
export function startCoveragePolling({ gitlabToken, applicationName, country, coverageKey, intervalMilliseconds, branch }) {
  clearCoverageData();
  gitlab_token = gitlabToken || ''
  app_name = applicationName || ''
  country_name = country
  branch_detail = branch || {}
  currentCoverageKey = coverageKey || '__coverage__';
  // 先清除可能存在的旧定时器
  if (coverageLogIntervalId) {
    clearInterval(coverageLogIntervalId);
  }
  localStorage.setItem(`${app_name}OpenCover`, 'open');
  coverageLogIntervalId = setInterval(() => {
    if (window[currentCoverageKey]) {
      console.log(`[Coverage Poll - ${new Date().toLocaleTimeString()}] Current coverage data snapshot:`, window[currentCoverageKey]);
      collectFinalCoverage();
    }
  }, intervalMilliseconds);

  console.log(`Started periodic coverage logging every ${intervalMilliseconds / 1000} seconds.`);
}

/**
 * 清空覆盖率数据
 */
function clearCoverageData() {
  window[currentCoverageKey] = null;
}

/**
 * 停止覆盖率数据的定期轮询日志
 */
export function stopCoveragePolling() {
  localStorage.setItem(`${app_name}OpenCover`, 'close');
  if (coverageLogIntervalId) {
    clearInterval(coverageLogIntervalId);
    coverageLogIntervalId = null;
    console.log('Stopped periodic coverage logging.');
  }
}

/**
 * 在卸载时收集并处理最终的覆盖率数据
 */
export function collectFinalCoverage() {
  const coverageData = window[currentCoverageKey];
  // 修改coverageData数据key 直接更改key 值删掉项目名

  if (coverageData) {
    fetch('https://10.99.72.87/api/coverage', {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        env: process.env.NODE_ENV
      },
      body: JSON.stringify({
        data: coverageData,
        gitlabToken: gitlab_token,
        country: country_name,
        applicationName: app_name,
        branchDetail: branch_detail,
        appId: app_id
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Report generated:');
      })
      .catch(err => {
        console.error('Error sending coverage data:', err);
      });
  } else {
    console.log('No final coverage data found inside unmount.');
  }
}
