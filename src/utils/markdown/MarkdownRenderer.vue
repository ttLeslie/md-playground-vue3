<template>
  <div class="markdown-renderer prose max-w-none">
    <!-- 递归渲染所有节点 -->
    <template v-for="(node, index) in tokenTree" :key="index">
      <TokenNode :node="node" />
    </template>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import TokenNode from "./TokenNode.vue";

// 接收 Token 树作为输入
const props = defineProps({
  tokenTree: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.markdown-renderer {
  @apply p-4 text-gray-800 dark:text-gray-200;
}

/* 基础样式重置 */
:deep(p) {
  @apply my-2;
}
:deep(h1) {
  @apply text-2xl font-bold my-4;
}
:deep(h2) {
  @apply text-xl font-bold my-3;
}
:deep(ul),
:deep(ol) {
  @apply pl-6 my-2;
}
:deep(ul) {
  @apply list-disc;
}
:deep(ol) {
  @apply list-decimal;
}
</style>
