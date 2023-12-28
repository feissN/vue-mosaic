<template>
  <div
    v-if="!isParent(node)"
    ref="mosaicWindowRef"
    class="mosaic-window mosaic-drop-target flex flex-col h-full relative select-none rounded-md overflow-hidden"
  >
    <div
      class="mosaic-window-toolbar bg-gray-600 p-1"
      :class="[totalWindowAmount !== 1 ? 'draggable cursor-move hover:bg-gray-500' : '']"
      :draggable="totalWindowAmount !== 1"
      @dragstart="handleDragStart"
    >
      {{ node.title }}
    </div>
    <div class="mosaic-window-body p-2 bg-gray-700 flex-1 h-full overflow-auto select-text">
      <slot>{{ node }}</slot>
    </div>
    <div class="drop-target-container absolute inset-0" :class="[mosaicIsDragging ? 'block' : 'hidden']">
      <div
        v-for="position of values(MosaicDropTargetPosition)"
        :key="position"
        class="drop-target inset-0 absolute bg-[#4c90f0] bg-opacity-40 border-2 border-[#4c90f0] rounded-md transition-opacity opacity-0 hover:opacity-100 cursor-alias"
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
        @mouseup="handleDragEnd($event, position)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dropRight from "lodash/dropRight";
import values from "lodash/values";
import { inject, ref, watchEffect } from "vue";
import { MosaicDraggingSourceItemKey, MosaicDraggingSourcePathKey, MosaicIsDraggingKey, MosaicRootActionsKey } from "../symbols/Mosaic";
import { MosaicBranch, MosaicNode } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import { MosaicDropTargetPosition } from "../utils/DragAndDrop";
import { isParent } from "../utils/Mosaic";
import { createDragToUpdates } from "../utils/MosaicUpdates";
import { injectStrict } from "../utils/InjectStrict";

const props = defineProps<{
  node: MosaicNode;
  boundingBox: BoundingBox;
  path: MosaicBranch[];
  totalWindowAmount: number;
}>();

const mosaicWindowRef = ref<HTMLDivElement>();

const mosaicDragElementClone = ref<HTMLDivElement | null>(null);
const mosaicDragElementCloneOriginalOffset = ref<{ x: number; y: number } | null>(null);
const mosaicDragElementClonePosition = ref<{ x: number; y: number } | null>(null);

const mosaicRootActions = injectStrict(MosaicRootActionsKey);
const mosaicIsDragging = injectStrict(MosaicIsDraggingKey);
const mosaicSourcePath = injectStrict(MosaicDraggingSourcePathKey);
const mosaicSourceItem = injectStrict(MosaicDraggingSourceItemKey);

watchEffect(() => {
  if (!mosaicDragElementClone.value || !mosaicDragElementClonePosition.value) return;

  mosaicDragElementClone.value.style.left = `${mosaicDragElementClonePosition.value.x}px`;
  mosaicDragElementClone.value.style.top = `${mosaicDragElementClonePosition.value.y}px`;
});

const handleDragStart = (e: DragEvent) => {
  if (!mosaicRootActions || props.totalWindowAmount === 1) return;

  if (!mosaicWindowRef.value) return;

  const startX = e.clientX;
  const startY = e.clientY;

  const targetElement = e.target as HTMLDivElement;

  mosaicDragElementCloneOriginalOffset.value = {
    x: startX - targetElement.getBoundingClientRect().left,
    y: startY - targetElement.getBoundingClientRect().top,
  };
  mosaicDragElementClonePosition.value = {
    x: startX - mosaicWindowRef.value.offsetLeft,
    y: startY - mosaicWindowRef.value.offsetTop,
  };
  mosaicDragElementClone.value = mosaicWindowRef.value.cloneNode(true) as HTMLDivElement;
  mosaicDragElementClone.value.style.color = "white";
  mosaicDragElementClone.value.style.opacity = "50%";
  mosaicDragElementClone.value.style.position = "fixed";
  mosaicDragElementClone.value.style.pointerEvents = "none";
  mosaicDragElementClone.value.style.width = `${mosaicWindowRef.value.clientWidth}px`;
  mosaicDragElementClone.value.style.height = `${mosaicWindowRef.value.clientHeight}px`;
  document.body.appendChild(mosaicDragElementClone.value as unknown as Node);

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  mosaicRootActions.hide(props.path);
  mosaicIsDragging!.value = true;
  mosaicSourcePath!.value = props.path;
};

const handleMouseMove = (e: MouseEvent) => {
  mosaicDragElementClonePosition.value = {
    x: e.clientX - (mosaicDragElementCloneOriginalOffset.value?.x || 0),
    y: e.clientY - (mosaicDragElementCloneOriginalOffset.value?.y || 0),
  };
};

const handleMouseUp = (e: MouseEvent) => {
  if (mosaicDragElementClone.value) {
    document.body.removeChild(mosaicDragElementClone.value as unknown as Node);
  }

  mosaicDragElementClone.value = null;
  mosaicDragElementCloneOriginalOffset.value = null;
  mosaicDragElementClonePosition.value = null;

  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);

  mosaicIsDragging!.value = false;

  if ((e.target as HTMLElement).classList?.contains("drop-target")) return;
  e.preventDefault;

  mosaicRootActions.updateTree(
    [
      {
        path: dropRight(props.path),
        spec: {
          splitPercentage: {
            $set: undefined,
          },
        },
      },
    ],
    false,
    true
  );
};

const handleDragEnd = (event: MouseEvent, position: MosaicDropTargetPosition) => {
  mosaicRootActions.updateTree(
    createDragToUpdates(mosaicRootActions.getRoot()!, mosaicSourcePath.value, props.path, position, mosaicSourceItem.value),
    false,
    true
  );
};
</script>
