<template>
  <div>
    <h1>测试 CoverageButton 导入</h1>
    <CoverageButton />
  </div>
</template>

<script>
// 测试不同的导入方式
import CoverageButton from "@jt-coverage/vue3/lib/CoverageButton.vue"

export default {
  name: 'TestCoverageButtonImport',
  components: {
    CoverageButton
  }
}
</script>