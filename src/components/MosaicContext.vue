<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import { MosaicDraggingSourcePathKey, MosaicIsDraggingKey, MosaicDraggingSourceItemKey } from "../symbols/Mosaic";

const isDragging = ref(false);
provide(MosaicIsDraggingKey, isDragging);

const draggingSourcePath = ref([]);
provide(MosaicDraggingSourcePathKey, draggingSourcePath);

const draggingSourceItem = ref();
provide(MosaicDraggingSourceItemKey, draggingSourceItem);
</script>
