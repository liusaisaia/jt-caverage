// src/utils/devCoverage.js

// 定时器 ID
let coverageLogIntervalId = null
const IS_DEVELOPMENT = ['development', 'test', 'uat'].includes(process.env.NODE_ENV)
// gitlab token
const gitlab_token = ''
// 项目名称
const project_name = 'sqs'
// app_name
const app_name = ''
// app_Id 
const app_id = ''
// 国家
const country_name = ''

/**
 * 设置手动保存覆盖率数据的全局函数 window.saveCoverage
*/
export function setupManualSave({ gitlabToken, projectName, country }) {
  if (!IS_DEVELOPMENT) return
  gitlab_token = gitlabToken || ''
  project_name = projectName || ''
  country_name = country

  window.saveCoverage = () => {
    const coverageData = window.__coverage__
    if (coverageData) {
      try {
        const blob = new Blob([JSON.stringify(coverageData)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `coverage-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error saving coverage data:', error)
      }
    }
  }
}

/**
 * 启动覆盖率数据的定期轮询日志
 * @param {number} intervalMilliseconds - 轮询间隔（毫秒）
 */
export function startCoveragePolling(intervalMilliseconds = 5000) {
  if (!IS_DEVELOPMENT) return

  // 先清除可能存在的旧定时器
  if (coverageLogIntervalId) {
    clearInterval(coverageLogIntervalId)
  }

  coverageLogIntervalId = setInterval(() => {
    if (window.__coverage__) {
      collectFinalCoverage()
    } else {
      // 在覆盖率数据尚未生成时保持安静或只打印一次提示
      // console.log(`[Coverage Poll - ${new Date().toLocaleTimeString()}] window.__coverage__ not found yet.`);
    }
  }, intervalMilliseconds)
}

/**
 * 停止覆盖率数据的定期轮询日志
 */
export function stopCoveragePolling() {
  if (!IS_DEVELOPMENT) return

  if (coverageLogIntervalId) {
    clearInterval(coverageLogIntervalId)
    coverageLogIntervalId = null
    console.log('Stopped periodic coverage logging.')
  }
}

/**
 * 在卸载时收集并处理最终的覆盖率数据
 */
export function collectFinalCoverage() {
  if (!IS_DEVELOPMENT) return

  const coverageData = window.__coverage__
  // 修改coverageData数据key 直接更改key 值删掉项目名

  if (coverageData) {
    fetch('http://10.99.72.87:4399/api/coverage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        env: process.env.NODE_ENV
      },
      body: JSON.stringify({
        data: window.__coverage__,
        gitlabToken: gitlab_token,
        appName: app_name,
        country: country_name,
        projectName: project_name,
        appId: app_id
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Report generated:', data.urls.latest)
      })
      .catch(err => {
        console.error('Error sending coverage data:', err)
      })
  } else {
    console.log('No final coverage data found inside unmount.')
  }
}
