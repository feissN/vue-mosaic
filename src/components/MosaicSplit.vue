<template>
  <div
    class="mosaic-split mosaic-split-line absolute z-10 bg-black"
    :class="[direction === 'column' ? 'mt-[-3px] h-[6px] cursor-ns-resize' : 'ml-[-3px] w-[6px] cursor-ew-resize']"
    :style="{ ...styles }"
    ref="resizerRef"
    @mousedown.prevent="handleMouseDown"
  ></div>
</template>

<script setup lang="ts">
import clamp from "lodash/clamp";
import throttle from "lodash/throttle";
import { computed, ref } from "vue";
import { MosaicBranch, MosaicDirection } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";

const props = defineProps<{
  direction: MosaicDirection;
  boundingBox: BoundingBox;
  splitPercentage: number;
  path: MosaicBranch[];
  minimumPaneSizePercentage: number;
}>();

const emit = defineEmits<{
  (event: "release", amount: number): void;
  (event: "change", amount: number): void;
}>();

const resizerRef = ref<HTMLDivElement>();
const listenersBound = ref(false);

const styles = computed(() => {
  const positionStyle = props.direction === "column" ? "top" : "left";
  const absolutePercentage = BoundingBox.getAbsoluteSplitPercentage(props.boundingBox, props.splitPercentage, props.direction);
  return {
    ...BoundingBox.asStyles(props.boundingBox),
    [positionStyle]: `${absolutePercentage}%`,
  };
});

const calculateRelativePercentage = (event: MouseEvent): number => {
  const parentBBox = resizerRef.value!.parentElement!.getBoundingClientRect();
  const location = event;

  let absolutePercentage: number;
  if (props.direction === "column") {
    absolutePercentage = ((location.clientY - parentBBox.top) / parentBBox.height) * 100.0;
  } else {
    absolutePercentage = ((location.clientX - parentBBox.left) / parentBBox.width) * 100.0;
  }

  const relativePercentage = BoundingBox.getRelativeSplitPercentage(props.boundingBox, absolutePercentage, props.direction);

  return clamp(relativePercentage, props.minimumPaneSizePercentage!, 100 - props.minimumPaneSizePercentage!);
};

const throttledUpdatePercentage = throttle((event: MouseEvent) => {
  const percentage = calculateRelativePercentage(event);
  if (percentage !== props.splitPercentage) {
    emit("change", percentage);
  }
}, 1000 / 60);

const bindListeners = () => {
  if (!listenersBound.value) {
    resizerRef.value!.ownerDocument!.addEventListener("mousemove", handleMouseMove, true);
    resizerRef.value!.ownerDocument!.addEventListener("mouseup", handleMouseUp, true);
    listenersBound.value = true;
  }
};

const unbindListeners = () => {
  if (resizerRef.value) {
    resizerRef.value.ownerDocument!.removeEventListener("mousemove", handleMouseMove, true);
    resizerRef.value.ownerDocument!.removeEventListener("mouseup", handleMouseUp, true);
    listenersBound.value = false;
  }
};

const handleMouseDown = () => {
  bindListeners();
};

const handleMouseUp = (event: MouseEvent) => {
  unbindListeners();

  const percentage = calculateRelativePercentage(event);
  emit("release", percentage);
};

const handleMouseMove = (event: MouseEvent) => {
  event.preventDefault();

  throttledUpdatePercentage(event);
};
</script>
