<template>
  <template v-if="isParent((node as MosaicNode<T>))">
    <MosaicRootContent :node="(node as MosaicParent<any>).first " :bounding-box="boundingBoxes.first" :path="path.concat('first')">
      <template #default="{ boundingBox, node, path }">
        <slot name="default" :node="node" :path="path" :bounding-box="boundingBox"> </slot>
      </template>
    </MosaicRootContent>

    <MosaicSplit
      :direction="(node as MosaicParent<T>).direction"
      :bounding-box="boundingBox"
      :split-percentage="splitPercentage"
      :path="path"
      :minimum-pane-size-percentage="10"
      @release="handleResize($event, path, false)"
      @change="handleResize($event, path, true)"
    />

    <MosaicRootContent :node="(node as MosaicParent<any>).second " :bounding-box="boundingBoxes.second" :path="path.concat('second')">
      <template #default="{ boundingBox, node, path }">
        <slot name="default" :node="node" :path="path" :bounding-box="boundingBox"> </slot>
      </template>
    </MosaicRootContent>
  </template>
  <div v-else class="mosaic-tile absolute m-[3px]" :style="{ ...BoundingBox.asStyles(boundingBox) }">
    <slot name="default" :node="node" :path="path" :bounding-box="boundingBox"> {{ node }} </slot>
  </div>
</template>

<script setup lang="ts" generic="T extends MosaicKey">
import { computed, inject } from "vue";
import { UpdateTreeKey } from "../symbols/Mosaic";
import { MosaicBranch, MosaicKey, MosaicNode, MosaicParent } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import { isParent } from "../utils/Mosaic";
import MosaicSplit from "./MosaicSplit.vue";

const props = defineProps<{
  node: MosaicNode<T>;
  boundingBox: BoundingBox;
  path: MosaicBranch[];
}>();

const updateTree = inject(UpdateTreeKey);
const splitPercentage = computed(() => {
  if (!isParent(props.node)) return 50;

  return props.node.splitPercentage == null ? 50 : props.node.splitPercentage;
});

const boundingBoxes = computed(() => {
  if (!isParent(props.node)) return null;

  const { first, second } = BoundingBox.split(props.boundingBox, splitPercentage.value, props.node.direction);

  return {
    first,
    second,
  };
});

const handleResize = (percentage: number, path: MosaicBranch[], suppressOnRelease: boolean) => {
  if (!updateTree) return;

  updateTree(
    [
      {
        path,
        spec: {
          splitPercentage: {
            $set: percentage,
          },
        },
      },
    ],
    suppressOnRelease
  );
};
</script>
