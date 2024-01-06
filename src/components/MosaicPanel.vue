<template>
  <div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  windowTitle: string;
}>();

defineExpose({
  windowTitle: props.windowTitle,
});
</script>
