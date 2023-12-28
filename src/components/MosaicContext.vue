<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import {
  MosaicDraggingSourcePathKey,
  MosaicIsDraggingKey,
  MosaicDraggingSourceItemKey,
  MosaicContextAllLeavesKey,
  MosaicContextActiveLeavesKey,
} from "../symbols/Mosaic";
import { MosaicItem } from "../types/Mosaic";

const props = defineProps<{
  allItems: MosaicItem[];
}>();

const activeLeaves = ref<MosaicItem[]>([]);
provide(MosaicContextActiveLeavesKey, activeLeaves);

const isDragging = ref(false);
provide(MosaicIsDraggingKey, isDragging);

const draggingSourcePath = ref([]);
provide(MosaicDraggingSourcePathKey, draggingSourcePath);

const draggingSourceItem = ref();
provide(MosaicDraggingSourceItemKey, draggingSourceItem);

const allLeaves = ref(props.allItems);
provide(MosaicContextAllLeavesKey, allLeaves);
</script>
