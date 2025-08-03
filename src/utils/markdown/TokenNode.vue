<template>
  <component :is="renderComponent" :node="node" v-bind="componentProps">
    <!-- 递归渲染子节点 -->
    <template v-if="node.children && node.children.length">
      <template v-for="(child, i) in node.children" :key="i">
        <TokenNode :node="child" />
      </template>
    </template>
  </component>
</template>

<script setup>
import { computed } from "vue";
import { defineProps } from "vue";
// 导入具体类型组件
// import Paragraph from "./nodes/Paragraph.vue";
// import Heading from "./nodes/Heading.vue";
import CodeBlock from "./nodes/CodeBlock.vue";
// import Link from "./nodes/Link.vue";
// import Image from "./nodes/Image.vue";
// import List from "./nodes/List.vue";
// import ListItem from "./nodes/ListItem.vue";
// import Text from "./nodes/Text.vue";

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

// 映射 Token 类型到组件
const renderComponent = computed(() => {
  const { type } = props.node;

  // 块级元素
  if (type.startsWith("heading_")) return Heading;
  if (type === "paragraph_open") return Paragraph;
  if (type === "fence") return CodeBlock;
  if (type.startsWith("list_")) return List;
  if (type.startsWith("list_item_")) return ListItem;

  // 行内元素
  if (type === "link_open") return Link;
  if (type === "image") return Image;
  if (type === "text") return Text;

  // 默认使用通用容器
  return "div";
});

// 提取组件需要的属性
const componentProps = computed(() => {
  const { attrs, content, markup, type } = props.node;
  // 将 attrs 数组转换为对象 { name: value }
  const attrsObj = (attrs || []).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});

  return {
    ...attrsObj,
    content,
    markup,
    type,
  };
});
</script>
