<template>
  <div class="bg-gray-700 w-24 h-full p-1 flex flex-col gap-2 relative">
    <slot></slot>
    <div class="drop-target-container absolute inset-0" :class="[mosaicIsDragging ? 'block' : 'hidden']">
      <div
        v-for="position of values(MosaicDropTargetPosition)"
        :key="position"
        class="drop-target top inset-0 absolute bg-[#4c90f0] bg-opacity-40 border-2 border-[#4c90f0] rounded-md transition-opacity opacity-0 hover:opacity-100 cursor-alias"
        @mouseup="handleDragEnd($event, 'top')"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import values from "lodash/values";
import { MosaicDraggingSourcePathKey, MosaicIsDraggingKey } from "../symbols/Mosaic";
import { MosaicDropTargetPosition } from "../utils/DragAndDrop";
import { injectStrict } from "../utils/InjectStrict";

// const mosaicRootActions = injectStrict(MosaicRootActionsKey);
const mosaicIsDragging = injectStrict(MosaicIsDraggingKey);
const mosaicDraggingSourcePath = injectStrict(MosaicDraggingSourcePathKey);

const handleDragEnd = (event: MouseEvent, position: MosaicDropTargetPosition) => {
  //   mosaicRootActions.updateTree([createRemoveUpdate(mosaicRootActions.getRoot(), mosaicDraggingSourcePath.value)], false, true);
};
</script>