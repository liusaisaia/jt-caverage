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
    // 国家/地区代码
    country: {
      type: String,
      default: 'my'
    },
    // 在哪些分支上显示按钮
    visibleBranches: {
      type: Array,
      default: () => ['lss-test'] // 保持默认行为，但现在可以被覆盖
    },
    pollingInterval: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      // 是否开启覆盖率任务
      coverage: false,
      branch: {},
      isHovered: false
    }
  },
  created() {
    // 判断当前项目分支
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
          // 刷新页面
          location.reload()
        } else {
          stopCoveragePolling()
          collectFinalCoverage() // 收集并处理最终数据
          localStorage.removeItem(`${this.branch.projectName}OpenCover`)
        }
      })
    },
    startCoverage() {
      startCoveragePolling({
        // 国家
        country: this.country,
        // 项目
        intervalMilliseconds: this.pollingInterval, // 轮询间隔时间，单位毫秒
        branch: this.branch, // 分支信息
        selfObj: this
      }) // 设置 window.saveCoverage
    }
  },
  // 组件销毁停止轮询
  beforeDestroy() {
    stopCoveragePolling()
    collectFinalCoverage() // 收集并处理最终数据
  }
}
</script>

<style>
.coverage-button-wrapper {
  position: fixed;
  right: 0;
  bottom: 50%;
  transform: translateY(50%);
  z-index: 9999;
}

.coverage-edge-btn {
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-right: none;
  border-radius: 8px 0 0 8px;
  padding: 6px;
  cursor: pointer;
  box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  position: relative;

  /* 固定宽度，默认隐藏在边缘 */
  width: 20px;
  transform: translateX(calc(100% - 20px));
}

/* 悬浮时完全滑出 */
.coverage-edge-btn.expanded {
  transform: translateX(0);
  box-shadow: -4px 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

/* 激活状态 */
.coverage-edge-btn.active {
  background: #fff2f0;
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.coverage-edge-btn.active.expanded {
  border-color: #ff7875;
  box-shadow: -4px 4px 12px rgba(255, 77, 79, 0.2);
}

.btn-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
}

.btn-label {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.coverage-edge-btn.active .btn-label {
  color: #ff4d4f;
}

/* 状态指示器 */
.status-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 4px rgba(82, 196, 26, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .coverage-edge-btn {
    width: 90px;
    transform: translateX(calc(100% - 36px));
  }

  .btn-icon {
    font-size: 14px;
  }

  .btn-label {
    font-size: 11px;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .coverage-edge-btn {
    background: #2c2c2c;
    border-color: #404040;
    color: #ffffff;
    box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.3);
  }

  .coverage-edge-btn.expanded {
    border-color: #409eff;
    background: #363636;
    box-shadow: -4px 4px 12px rgba(0, 0, 0, 0.4);
  }

  .coverage-edge-btn.active {
    background: #3d2b2b;
    border-color: #ff6b6b;
    color: #ff6b6b;
  }

  .btn-label {
    color: #cccccc;
  }

  .coverage-edge-btn.active .btn-label {
    color: #ff6b6b;
  }
}

/* 原生图标样式 */
.coverage-icon {
  display: inline-block;
  font-size: 14px;
  line-height: 1;
  vertical-align: middle;
}

.coverage-pause {
  font-weight: bold;
}

.coverage-analysis {
  font-size: 12px;
}
</style>
