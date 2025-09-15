// CommonJS版本的devCoverage.js

// 定时器 ID
let coverageTimeoutId = null
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

// 存储this
let self = null

/**
 * 启动覆盖率数据的定期轮询日志
 * @param {number} intervalMilliseconds - 轮询间隔（毫秒）
 */
export function startCoveragePolling({ gitlabToken, country, intervalMilliseconds, branch, selfObj }) {
  self = selfObj || null
  clearCoverageData();
  gitlab_token = gitlabToken || ''
  app_name = branch.projectName || ''
  country_name = country
  branch_detail = branch || {}
  currentCoverageKey = branch.coverageKey || '__coverage__';

  // 先清除可能存在的旧定时器
  if (coverageTimeoutId) {
    clearTimeout(coverageTimeoutId);
  }

  localStorage.setItem(`${app_name}OpenCover`, 'open');

  // 定义递归函数
  async function scheduleNext() {
    if (window[currentCoverageKey]) {
      try {
        const data = await collectFinalCoverage();
        // if (data.code === 2) {
        //   clearCoverageData();
        //   self.$confirm(`前端页面更新请刷新页面`, '提示', {
        //     confirmButtonText: '确定',
        //     cancelButtonText: '取消',
        //     type: 'warning'
        //   }).then(() => {
        //     location.reload();
        //   });
        //   return; // 停止循环
        // }
      } catch (error) {
        console.error('覆盖率数据收集失败:', error);
      }
    }

    // 等待上一个请求完成后再安排下一次
    coverageTimeoutId = setTimeout(scheduleNext, intervalMilliseconds);
  }

  // 立即开始第一次
  scheduleNext();

  console.log(`Started periodic coverage logging every ${intervalMilliseconds / 1000} seconds.`);
}

// 修改停止函数
export function stopCoveragePolling() {
  if (coverageTimeoutId) {
    clearTimeout(coverageTimeoutId);
    coverageTimeoutId = null;
    console.log('Stopped periodic coverage logging.');
  }
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
// export function stopCoveragePolling() {
//   if (coverageLogIntervalId) {
//     clearInterval(coverageLogIntervalId);
//     coverageLogIntervalId = null;
//     console.log('Stopped periodic coverage logging.');
//   }
// }

/**
 * 在卸载时收集并处理最终的覆盖率数据
 */
export async function collectFinalCoverage() {
  const coverageData = window[currentCoverageKey];

  if (!coverageData) {
    console.log('No final coverage data found inside unmount.');
    return null;
  }

  try {
    const response = await fetch('https://10.99.72.87/api/coverage', {
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
    });

    const data = await response.json();

    return data; // 现在可以正确返回了

  } catch (err) {
    console.error('Error sending coverage data:', err);
    throw err; // 向上传递错误
  }
}
