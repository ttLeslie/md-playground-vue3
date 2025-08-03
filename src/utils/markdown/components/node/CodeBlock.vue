<template>
  <div class="code-block relative">
    <div
      class="code-header flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-t-md"
    >
      <span class="text-xs font-mono text-gray-500">{{ language }}</span>
      <button
        @click="copyToClipboard"
        class="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <i class="fa fa-copy mr-1"></i>复制
      </button>
    </div>
    <div
      v-html="node.content"
      class="p-4 bg-gray-50 dark:bg-gray-900 rounded-b-md overflow-x-auto"
    ></div>
  </div>
</template>

<script setup>
import { useClipboard, useToast } from "vueuse/core";
import { defineProps } from "vue";

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

// 提取语言类型（info 属性）
const language = props.node.info || "text";

// 复制功能
const { copy, isSupported } = useClipboard();
const { toast } = useToast();

const copyToClipboard = () => {
  if (!isSupported) {
    toast.error("浏览器不支持复制功能");
    return;
  }
  // 提取纯文本内容（去除高亮标签）
  const plainText =
    new DOMParser().parseFromString(props.node.content, "text/html").body
      .textContent || "";

  copy(plainText);
  toast.success("复制成功");
};
</script>

<style scoped>
.code-block {
  @apply my-4 rounded-md border border-gray-200 dark:border-gray-700;
}
.code-header {
  @apply font-mono;
}
</style>
