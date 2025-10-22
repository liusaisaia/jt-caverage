/**
 * 使用动态导入避免构建时错误的示例
 * 文件名: dynamic-coverage-import.vue
 */

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>我的Vue 3应用</h1>
      <!-- 覆盖率控制按钮 -->
      <div class="coverage-controls">
        <button 
          @click="loadAndToggleCoverage" 
          :disabled="isLoading"
          class="control-button"
        >
          {{ isLoading ? '加载中...' : (isActive ? '关闭覆盖率' : '开启覆盖率') }}
        </button>
      </div>
    </header>
    
    <main class="app-main">
      <section class="content-section">
        <h2>应用内容</h2>
        <p>这是应用的主要内容区域。</p>
        
        <!-- 覆盖率按钮 - 动态加载 -->
        <div class="coverage-button-container" v-if="showCoverageButton && CoverageButton">
          <CoverageButton 
            :config="coverageConfig"
            @coverage-started="handleCoverageStarted"
            @coverage-stopped="handleCoverageStopped"
            @coverage-error="handleCoverageError"
          />
        </div>
        
        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          错误: {{ error }}
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

// 响应式状态
const isLoading = ref(false);
const error = ref(null);
const isActive = ref(false);
const showCoverageButton = ref(false);
const CoverageButton = ref(null);

// 覆盖率配置
const coverageConfig = reactive({
  apiUrl: 'https://your-coverage-api.com/coverage',
  interval: 5000,
  autoStart: false
});

// 动态加载覆盖率组件
const loadCoverageComponent = async () => {
  if (CoverageButton.value) return true; // 已加载
  
  try {
    isLoading.value = true;
    error.value = null;
    
    // 使用动态导入加载CoverageButton组件
    const module = await import('@jt-coverage/vue3/lib/CoverageButton.vue');
    CoverageButton.value = module.default;
    
    return true;
  } catch (err) {
    error.value = err.message || '加载覆盖率组件失败';
    console.error('加载覆盖率组件失败:', err);
    return false;
  } finally {
    isLoading.value = false;
  }
};

// 加载并切换覆盖率按钮显示状态
const loadAndToggleCoverage = async () => {
  const success = await loadCoverageComponent();
  if (success) {
    showCoverageButton.value = !showCoverageButton.value;
    isActive.value = showCoverageButton.value;
  }
};

// 覆盖率事件处理
const handleCoverageStarted = () => {
  console.log('覆盖率收集已开始');
  isActive.value = true;
};

const handleCoverageStopped = () => {
  console.log('覆盖率收集已停止');
  isActive.value = false;
};

const handleCoverageError = (err) => {
  console.error('覆盖率工具错误:', err);
  error.value = err.message || '覆盖率工具发生错误';
};

// 组件挂载后的初始化
onMounted(() => {
  console.log('应用已挂载');
});
</script>

<style scoped>
.app-container {
  font-family: 'Arial', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.coverage-controls {
  display: flex;
  gap: 10px;
}

.control-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.control-button:hover {
  background-color: #45a049;
}

.control-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.content-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.coverage-button-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
}
</style>