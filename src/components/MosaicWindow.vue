<template>
  <div
    v-if="!isParent(node)"
    ref="mosaicWindowRef"
    class="mosaic-droppable mosaic-window mosaic-drop-target flex flex-col h-full relative select-none rounded-md overflow-hidden"
  >
    <div
      class="mosaic-window-toolbar h-10 bg-gray-600 p-1 flex items-center justify-between draggable cursor-move hover:bg-gray-500"
      :draggable="true"
      @dragstart="handleDragStart"
    >
      <div>
        {{ title }}
      </div>
      <div
        @click.stop="handleRemove"
        class="cursor-pointer hover:bg-gray-600 transition-colors rounded-full w-8 h-8 flex items-center justify-center"
      >
        X
      </div>
    </div>
    <div class="mosaic-window-body p-2 bg-gray-700 flex-1 h-full overflow-auto select-text">
      <slot></slot>
    </div>
    <div class="drop-target-container absolute inset-0" :class="[mosaicIsDragging ? 'block' : 'hidden']">
      <div
        v-for="position of values(MosaicDropTargetPosition)"
        :key="position"
        class="drop-target inset-0 absolute"
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
import { nextTick, ref, watchEffect } from "vue";
import {
  MosaicContextActiveLeavesKey,
  MosaicContextAllLeavesKey,
  MosaicContextInactiveLeavesKey,
  MosaicDraggingSourceItemKey,
  MosaicDraggingSourcePathKey,
  MosaicIsDraggingKey,
  MosaicRootActionsKey,
} from "../symbols/Mosaic";
import { MosaicBranch, MosaicNode } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import { MosaicDropTargetPosition } from "../utils/DragAndDrop";
import { injectStrict } from "../utils/InjectStrict";
import { getLeaves, isParent } from "../utils/Mosaic";
import { createDragToUpdates, createRemoveUpdate } from "../utils/MosaicUpdates";

const props = defineProps<{
  title: string;
  node: MosaicNode;
  boundingBox: BoundingBox;
  path: MosaicBranch[];
}>();

const emit = defineEmits<{
  (event: "dropped"): void;
  (event: "mousedown", mouseEvent: MouseEvent): void;
  (event: "mousemove", mouseEvent: MouseEvent): void;
  (event: "mouseup", mouseEvent: MouseEvent): void;
}>();

const mosaicWindowRef = ref<HTMLDivElement>();

const mosaicDragElementClone = ref<HTMLDivElement | null>(null);
const mosaicDragElementCloneOriginalOffset = ref<{ x: number; y: number } | null>(null);
const mosaicDragElementClonePosition = ref<{ x: number; y: number } | null>(null);

const mosaicRootActions = injectStrict(MosaicRootActionsKey);
const mosaicIsDragging = injectStrict(MosaicIsDraggingKey);
const mosaicSourcePath = injectStrict(MosaicDraggingSourcePathKey);
const mosaicSourceItem = injectStrict(MosaicDraggingSourceItemKey);
const allLeaves = injectStrict(MosaicContextAllLeavesKey);
const inactiveLeaves = injectStrict(MosaicContextInactiveLeavesKey);
const activeLeaves = injectStrict(MosaicContextActiveLeavesKey);

watchEffect(() => {
  if (!mosaicDragElementClone.value || !mosaicDragElementClonePosition.value) return;

  mosaicDragElementClone.value.style.left = `${mosaicDragElementClonePosition.value.x}px`;
  mosaicDragElementClone.value.style.top = `${mosaicDragElementClonePosition.value.y}px`;
});

const handleDragStart = (e: DragEvent) => {
  if (!mosaicRootActions) return;
  if (!mosaicWindowRef.value) return;

  const startX = e.clientX;
  const startY = e.clientY;

  const targetElement = e.target as HTMLDivElement;

  mosaicDragElementCloneOriginalOffset.value = {
    x: startX - targetElement.getBoundingClientRect().left,
    y: startY - targetElement.getBoundingClientRect().top,
  };
  mosaicDragElementClonePosition.value = {
    x: startX - e.offsetX,
    y: startY - e.offsetY,
  };
  mosaicDragElementClone.value = mosaicWindowRef.value.cloneNode(true) as HTMLDivElement;
  mosaicDragElementClone.value.style.transition = "transform";
  mosaicDragElementClone.value.style.transitionDuration = "500ms";
  mosaicDragElementClone.value.style.transformOrigin = `${e.offsetX}px ${e.offsetY}px`;
  mosaicDragElementClone.value.style.color = "white";
  mosaicDragElementClone.value.style.opacity = "75%";
  mosaicDragElementClone.value.style.position = "fixed";
  mosaicDragElementClone.value.style.pointerEvents = "none";
  mosaicDragElementClone.value.style.border = "2px solid white";
  mosaicDragElementClone.value.style.width = `${mosaicWindowRef.value.clientWidth}px`;
  mosaicDragElementClone.value.style.height = `${mosaicWindowRef.value.clientHeight}px`;

  setTimeout(() => {
    mosaicDragElementClone.value!.style.transform = `scale(0.5)`;
  });

  document.body.appendChild(mosaicDragElementClone.value as unknown as Node);

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  mosaicRootActions.hide(props.path);
  mosaicIsDragging!.value = true;
  mosaicSourcePath!.value = props.path;

  emit("mousedown", e);
};

const handleMouseMove = (e: MouseEvent) => {
  mosaicDragElementClonePosition.value = {
    x: e.clientX - (mosaicDragElementCloneOriginalOffset.value?.x || 0),
    y: e.clientY - (mosaicDragElementCloneOriginalOffset.value?.y || 0),
  };

  emit("mousemove", e);
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

  emit("mouseup", e);

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
  emit("dropped");
  emit("mouseup", event);
};

const handleRemove = async () => {
  mosaicRootActions.updateTree([createRemoveUpdate(mosaicRootActions.getRoot(), props.path)], false, true);

  await nextTick();

  const newLeaves = getLeaves(mosaicRootActions.getRoot());
  activeLeaves.value = newLeaves;
  inactiveLeaves.value = allLeaves.value.filter(({ key }) => !activeLeaves.value.includes(key)).map(({ key }) => key);
};
</script>
