<template>
  <div ref="mosaicDragItemRef">
    <div class="cursor-move hover:bg-slate-500 p-1 rounded-md overflow-hidden" draggable="true" @dragstart="handleDragStart">
      {{ title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watchEffect } from "vue";
import { MosaicDraggingSourceItemKey, MosaicDraggingSourcePathKey, MosaicIsDraggingKey, MosaicRootActionsKey } from "../symbols/Mosaic";
import { MosaicDropTargetPosition } from "../utils/DragAndDrop";
import { createDragToUpdates } from "../utils/MosaicUpdates";
import { injectStrict } from "../utils/InjectStrict";
import Hello from "./previews/Hello.vue";

const props = defineProps<{
  title: string;
}>();

const mosaicDragItemRef = ref<HTMLDivElement>();

const mosaicDragElementClone = ref<HTMLDivElement | null>(null);
const mosaicDragElementCloneOriginalOffset = ref<{ x: number; y: number } | null>(null);
const mosaicDragElementClonePosition = ref<{ x: number; y: number } | null>(null);

const mosaicIsDragging = injectStrict(MosaicIsDraggingKey);
const mosaicSourcePath = injectStrict(MosaicDraggingSourcePathKey);
const mosaicSourceItem = injectStrict(MosaicDraggingSourceItemKey);

watchEffect(() => {
  if (!mosaicDragElementClone.value || !mosaicDragElementClonePosition.value) return;

  mosaicDragElementClone.value.style.left = `${mosaicDragElementClonePosition.value.x}px`;
  mosaicDragElementClone.value.style.top = `${mosaicDragElementClonePosition.value.y}px`;
});

const handleDragStart = (e: DragEvent) => {
  e.preventDefault();
  if (!mosaicDragItemRef.value) return;

  const startX = e.clientX;
  const startY = e.clientY;

  const targetElement = e.target as HTMLDivElement;

  mosaicDragElementCloneOriginalOffset.value = {
    x: startX - targetElement.getBoundingClientRect().left,
    y: startY - targetElement.getBoundingClientRect().top,
  };
  mosaicDragElementClonePosition.value = {
    x: startX - mosaicDragItemRef.value.offsetLeft,
    y: startY - mosaicDragItemRef.value.offsetTop,
  };
  mosaicDragElementClone.value = mosaicDragItemRef.value.cloneNode(true) as HTMLDivElement;
  mosaicDragElementClone.value.style.color = "white";
  mosaicDragElementClone.value.style.opacity = "50%";
  mosaicDragElementClone.value.style.position = "fixed";
  mosaicDragElementClone.value.style.pointerEvents = "none";
  mosaicDragElementClone.value.style.width = `${mosaicDragItemRef.value.clientWidth}px`;
  mosaicDragElementClone.value.style.height = `${mosaicDragItemRef.value.clientHeight}px`;
  document.body.appendChild(mosaicDragElementClone.value as unknown as Node);

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  mosaicIsDragging.value = true;
  mosaicSourcePath.value = [];
  mosaicSourceItem.value = {
    id: 'new-thingy',
    title: 'Wordwat',
    component: Hello
  };
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

  mosaicIsDragging.value = false;
  mosaicSourceItem.value = null;

  if ((e.target as HTMLElement).classList?.contains("drop-target")) return;
  e.preventDefault;
};
</script>
