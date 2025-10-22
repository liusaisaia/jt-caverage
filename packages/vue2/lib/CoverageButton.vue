<template>
  <div class="coverage-button-wrapper">
    <div
      @click="handleClose"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      :class="['coverage-edge-btn', { active: coverage, expanded: isHovered }]"
      :title="coverage ? '点击关闭覆盖率收集' : '点击开启覆盖率收集'"
    >
      <!-- 图标部分 -->
      <div class="btn-icon">
        <span v-if="coverage" class="coverage-icon coverage-pause">⏸</span>
        <span v-else class="coverage-icon coverage-analysis">📊</span>
      </div>

      <!-- 状态指示器 -->
      <div v-if="coverage" class="status-dot"></div>
    </div>
  </div>
</template>

<script>
import { startCoveragePolling, stopCoveragePolling, collectFinalCoverage } from './devCoverage'
import { $confirm } from './native-confirm.js'

export default {
  name: 'CoverageButton',
  props: {
    country: { type: String, default: 'my' },
    visibleBranches: { type: Array, default: () => ['lss-test'] },
    pollingInterval: { type: Number, default: 3000 }
  },
  data() {
    return { coverage: false, branch: {}, isHovered: false }
  },
  created() {
    const branchStr = process?.env?.GIT_BRANCH
    this.branch = branchStr ? JSON.parse(branchStr) : {}
    if (localStorage.getItem(`${this.branch.projectName}OpenCover`) === 'open') {
      this.startCoverage()
      this.coverage = true
    }
  },
  methods: {
    handleClose() {
      $confirm(`是否${this.coverage ? '关闭覆盖率' : '开启任务并刷新页面'}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.coverage = !this.coverage
        if (this.coverage) {
          localStorage.setItem(`${this.branch.projectName}OpenCover`, 'open')
          location.reload()
        } else {
          stopCoveragePolling()
          collectFinalCoverage()
          localStorage.removeItem(`${this.branch.projectName}OpenCover`)
        }
      })
    },
    startCoverage() {
      startCoveragePolling({
        country: this.country,
        intervalMilliseconds: this.pollingInterval,
        branch: this.branch,
        selfObj: this
      })
    }
  },
  beforeDestroy() {
    stopCoveragePolling()
    collectFinalCoverage()
  }
}
</script>

<style>
.coverage-button-wrapper{position:fixed;right:0;bottom:50%;transform:translateY(50%);z-index:9999}
.coverage-edge-btn{background:#fff;border:1px solid #e1e5e9;border-right:none;border-radius:8px 0 0 8px;padding:6px;cursor:pointer;box-shadow:-2px 2px 8px rgba(0,0,0,.1);transition:all .3s cubic-bezier(.4,0,.2,1);display:flex;align-items:center;gap:8px;user-select:none;position:relative;width:20px;transform:translateX(calc(100% - 20px))}
.coverage-edge-btn.expanded{transform:translateX(0);box-shadow:-4px 4px 12px rgba(0,0,0,.15);border-color:#409eff}
.coverage-edge-btn.active{background:#fff2f0;border-color:#ff4d4f;color:#ff4d4f}
.coverage-edge-btn.active.expanded{border-color:#ff7875;box-shadow:-4px 4px 12px rgba(255,77,79,.2)}
.btn-icon{font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;width:16px}
.btn-label{font-size:12px;font-weight:500;color:#606266;white-space:nowrap}
.coverage-edge-btn.active .btn-label{color:#ff4d4f}
.status-dot{position:absolute;top:8px;right:8px;width:6px;height:6px;background:#52c41a;border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(82,196,26,.7)}70%{transform:scale(1);box-shadow:0 0 0 4px rgba(82,196,26,0)}100%{transform:scale(.95);box-shadow:0 0 0 0 rgba(82,196,26,0)}}
@media (max-width:768px){.coverage-edge-btn{width:90px;transform:translateX(calc(100% - 36px))}.btn-icon{font-size:14px}.btn-label{font-size:11px}}
@media (prefers-color-scheme: dark){.coverage-edge-btn{background:#2c2c2c;border-color:#404040;color:#fff;box-shadow:-2px 2px 8px rgba(0,0,0,.3)}.coverage-edge-btn.expanded{border-color:#409eff;background:#363636;box-shadow:-4px 4px 12px rgba(0,0,0,.4)}.coverage-edge-btn.active{background:#3d2b2b;border-color:#ff6b6b;color:#ff6b6b}.btn-label{color:#ccc}.coverage-edge-btn.active .btn-label{color:#ff6b6b}}
.coverage-icon{display:inline-block;font-size:14px;line-height:1;vertical-align:middle}
.coverage-pause{font-weight:bold}
.coverage-analysis{font-size:12px}
</style>