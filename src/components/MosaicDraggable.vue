<template>
  <div v-if="!isVisible" :id="`inactive-item-${id}`">
    <div
      ref="mosaicDragItemRef"
      class="cursor-move hover:bg-slate-500 p-1 rounded-md overflow-hidden flex items-center justify-between"
      draggable="true"
      @dragstart="handleDragStart"
    >
      <div>{{ title }}</div>
      <div
        class="hover:cursor-pointer hover:bg-white hover:text-red-400 w-5 h-5 flex items-center justify-center rounded-full"
        @click.stop="handleDeleteItem"
      >
        <span>X</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import {
  MosaicContextActiveLeavesKey,
  MosaicDraggingSourceItemKey,
  MosaicDraggingSourcePathKey,
  MosaicIsDraggingKey,
} from "../symbols/Mosaic";
import { MosaicItem, MosaicPath } from "../types/Mosaic";
import { injectStrict } from "../utils/InjectStrict";

const props = defineProps<{ title: string; id: MosaicItem }>();
const emit = defineEmits<{
  (event: "delete"): void;
}>();

const mosaicDragItemRef = ref<HTMLDivElement>();

const mosaicDragElementClone = ref<HTMLDivElement | null>(null);
const mosaicDragElementCloneOriginalOffset = ref<{ x: number; y: number } | null>(null);
const mosaicDragElementClonePosition = ref<{ x: number; y: number } | null>(null);

const mosaicIsDragging = injectStrict(MosaicIsDraggingKey);
const mosaicSourcePath = injectStrict(MosaicDraggingSourcePathKey);
const mosaicSourceItem = injectStrict(MosaicDraggingSourceItemKey);
const mosaicActiveLeaves = injectStrict(MosaicContextActiveLeavesKey);

const isVisible = computed(() => {
  return mosaicActiveLeaves.value.includes(props.id);
});

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
  mosaicDragElementClone.value.style.transition = "transform";
  mosaicDragElementClone.value.style.transitionDuration = "500ms";
  mosaicDragElementClone.value.style.transformOrigin = `${e.offsetX}px ${e.offsetY}px`;
  mosaicDragElementClone.value.style.borderRadius = "0.375rem";
  mosaicDragElementClone.value.style.color = "white";
  mosaicDragElementClone.value.style.opacity = "75%";
  mosaicDragElementClone.value.style.position = "fixed";
  mosaicDragElementClone.value.style.pointerEvents = "none";
  mosaicDragElementClone.value.style.border = "2px solid white";
  mosaicDragElementClone.value.style.display = "flex";
  mosaicDragElementClone.value.style.alignItems = "center";
  mosaicDragElementClone.value.style.justifyContent = "space-between";
  mosaicDragElementClone.value.style.width = `${mosaicDragItemRef.value.clientWidth}px`;
  mosaicDragElementClone.value.style.height = `${mosaicDragItemRef.value.clientHeight}px`;

  setTimeout(() => {
    mosaicDragElementClone.value!.style.transform = `scale(1.25)`;
  });

  document.body.appendChild(mosaicDragElementClone.value as unknown as Node);

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  mosaicIsDragging.value = true;
  mosaicSourcePath.value = [];
  mosaicSourceItem.value = props.id;
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

const handleDeleteItem = () => {
  emit("delete");
};
</script>
