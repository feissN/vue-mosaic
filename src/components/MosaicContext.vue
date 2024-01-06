<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import {
  MosaicContextActionsProviderKey,
  MosaicContextActiveLeavesKey,
  MosaicContextInactiveLeavesKey,
  MosaicDraggingSourceItemKey,
  MosaicDraggingSourcePathKey,
  MosaicContextAllLeavesKey,
  MosaicIsDraggingKey,
} from "../symbols/Mosaic";
import { MosaicContextActionsProviders, MosaicItem } from "../types/Mosaic";

const allLeaves = ref([]);
provide(MosaicContextAllLeavesKey, allLeaves);

const inactiveLeaves = ref([]);
provide(MosaicContextInactiveLeavesKey, inactiveLeaves);

const activeLeaves = ref<MosaicItem[]>([]);
provide(MosaicContextActiveLeavesKey, activeLeaves);

const isDragging = ref(false);
provide(MosaicIsDraggingKey, isDragging);

const draggingSourcePath = ref([]);
provide(MosaicDraggingSourcePathKey, draggingSourcePath);

const draggingSourceItem = ref();
provide(MosaicDraggingSourceItemKey, draggingSourceItem);

const contextActionProviders: MosaicContextActionsProviders = {
  expand(path, percentage) {
    throw new Error(`[MosaicContext] expand not implemented in Mosaic`);
  },
  getRoot() {
    throw new Error(`[MosaicContext] getRoot not implemented in Mosaic`);
  },
  hide(path) {
    throw new Error(`[MosaicContext] hide not implemented in Mosaic`);
  },
  remove(path) {
    throw new Error(`[MosaicContext] remove not implemented in Mosaic`);
  },
  replaceWith(path, node) {
    throw new Error(`[MosaicContext] replaceWith not implemented in Mosaic`);
  },
  updateTree(updates, suppressOnRelease, refreshPortals) {
    throw new Error(`[MosaicContext] updateTree not implemented in Mosaic`);
  },
  handleAddPanel() {
    throw new Error(`[MosaicContext] handleAddPanel not implemented in Mosaic`);
  },
};
provide(MosaicContextActionsProviderKey, contextActionProviders);
</script>
