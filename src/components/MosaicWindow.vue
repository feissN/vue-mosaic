<template>
  <div class="mosaic-window mosaic-drop-target flex flex-col h-full relative select-none rounded-md overflow-hidden">
    <div class="mosaic-window-toolbar draggable cursor-move bg-gray-600 p-1 hover:bg-gray-500">{{ node }}</div>
    <div class="mosaic-window-body p-2 bg-gray-700 flex-1 h-full overflow-auto">
      <slot>{{ node }}</slot>
    </div>
    <div class="drop-target-container absolute inset-0 hidden">
      <div
        v-for="position of values(MosaicDropTargetPosition)"
        :key="position"
        class="drop-target inset-0 absolute bg-[#4c90f0] bg-opacity-40 border-2 border-[#4c90f0] rounded-md transition-opacity opacity-0 hover:opacity-100"
        :class="[
          position,
          position === 'top'
            ? 'bottom-[calc(100%-30%)]'
            : position === 'bottom'
            ? 'top-[calc(100%-30%)]'
            : position === 'left'
            ? 'right-[calc(100%-30%)]'
            : position === 'right'
            ? 'left-[calc(100%-30%)]'
            : '',
        ]"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends MosaicKey">
import { MosaicBranch, MosaicKey, MosaicNode } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import { MosaicDropTargetPosition } from "../utils/DragAndDrop";
import values from "lodash/values";

defineProps<{
  node: MosaicNode<T>;
  boundingBox: BoundingBox;
  path: MosaicBranch[];
}>();
</script>
