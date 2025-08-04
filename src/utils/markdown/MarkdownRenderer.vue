<template>
  <div class="markdown-renderer">
    <!-- 递归渲染所有节点 -->
    <template v-for="(node, index) in tokenTree" :key="index">
      <TokenNode :node="node" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import TokenNode from './components/TokenNode.vue';

// 接收 Token 树作为输入
const props = defineProps({
  tokenTree: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped></style>
