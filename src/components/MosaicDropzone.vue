<template>
  <div class="bg-gray-700 w-36 h-full p-1 flex flex-col gap-2 relative">
    <div
      class="hover:bg-slate-500 p-1 rounded-md overflow-hidden cursor-pointer hover:after:content-['+'] after:font-bold flex items-center gap-4 hover:underline"
      @click="handleAddNew"
    >
      Add new
    </div>
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
import {
  MosaicContextActionsProviderKey,
  MosaicContextActiveLeavesKey,
  MosaicDraggingSourcePathKey,
  MosaicIsDraggingKey,
} from "../symbols/Mosaic";
import { MosaicDropTargetPosition } from "../utils/DragAndDrop";
import { injectStrict } from "../utils/InjectStrict";
import { createRemoveUpdate } from "../utils/MosaicUpdates";
import { nextTick } from "vue";
import { getLeaves } from "../utils/Mosaic";

const mosaicContextActions = injectStrict(MosaicContextActionsProviderKey);
const mosaicIsDragging = injectStrict(MosaicIsDraggingKey);
const mosaicDraggingSourcePath = injectStrict(MosaicDraggingSourcePathKey);
const activeLeaves = injectStrict(MosaicContextActiveLeavesKey);

const handleDragEnd = async (event: MouseEvent, position: MosaicDropTargetPosition) => {
  if (!mosaicDraggingSourcePath.value.length) return;
  mosaicContextActions.updateTree([createRemoveUpdate(mosaicContextActions.getRoot(), mosaicDraggingSourcePath.value)], false, true);

  await nextTick();

  const newLeaves = getLeaves(mosaicContextActions.getRoot());
  activeLeaves.value = newLeaves;
};

const handleAddNew = () => {
  mosaicContextActions.handleAddPanel();
};
</script>
