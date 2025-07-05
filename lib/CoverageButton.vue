<template>
  <div class="global-dialog-button">
    <el-button
      type="primary"
      @click="handleClose"
      class="floating-button">
      <i class="el-icon-hot-water"></i>
    </el-button>
  </div>
</template>

<script>
import { startCoveragePolling, stopCoveragePolling, collectFinalCoverage } from './devCoverage';

export default {
  name: 'CoverageButton',
  props: {
    // 主项目名称，用于 localStorage 和数据上报
    applicationName: {
      type: String,
      required: true,
    },
    // 国家/地区代码
    country: {
      type: String,
      default: 'my',
    },
    // 在哪些分支上显示按钮
    visibleBranches: {
      type: Array,
      default: () => ['lss-test'], // 保持默认行为，但现在可以被覆盖
    },
    pollingInterval: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      // 是否开启覆盖率任务
      coverage: false,
      showBtn: false,
      branch: {}
    }
  },
  created() {
    // 判断当前项目分支
    const branchStr = process?.env?.GIT_BRANCH
    this.branch = branchStr ? JSON.parse(branchStr) : {};
    this.showBtn = this.visibleBranches.includes(this.branch?.branchName);
    console.log(this.branch, '----------->branch')
    if (localStorage.getItem(`${this.applicationName}OpenCover`) === 'open') {
      this.startCoverage();
      this.coverage = true
    }
  },
  methods: {
    handleClose() {
      this.$confirm(`是否${this.coverage ? '关闭覆盖率' : '开启任务并刷新页面'}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.coverage = !this.coverage
        if (this.coverage) {
          // 刷新页面
          // location.reload();
          this.startCoverage();
        } else {
          stopCoveragePolling();
          collectFinalCoverage(); // 收集并处理最终数据
        }
      })
    },
    startCoverage() {
      startCoveragePolling({
        // 国家
        country: this.country,
        // 项目
        applicationName: this.applicationName,
        coverageKey: this.applicationName, // 覆盖率键名，用于区分不同的覆盖率数据
        intervalMilliseconds: this.pollingInterval, // 轮询间隔时间，单位毫秒
        branch: this.branch // 分支信息
      }); // 设置 window.saveCoverage
    },
    /**
     * 伪代码测试覆盖率数据收集
     */
    pseudocode() {
      if (process.env.VUE_APP_ENV === 'prod') {
        return;
      }
      startCoveragePolling({
        // 国家
        country: this.country,
        // 项目
        applicationName: this.applicationName,
        coverageKey: this.applicationName, // 覆盖率键名，用于区分不同的覆盖率数据
        intervalMilliseconds: 30000 // 轮询间隔时间，单位毫秒
      })
    }
  },
  // 组件销毁停止轮询
  beforeDestroy() {
    stopCoveragePolling();
    collectFinalCoverage(); // 收集并处理最终数据
  }
}
</script>

<style>
.floating-button {
  position: fixed;
  right: 0px;
  bottom: 50%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 20px;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 0;
}
</style>
