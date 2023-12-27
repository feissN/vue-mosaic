<template>
  <template v-if="isParent(node)">
    <MosaicRootContent :node="node.first" :bounding-box="boundingBoxes.first" :path="path.concat('first')"> </MosaicRootContent>

    <MosaicSplit
      :direction="node.direction"
      :bounding-box="boundingBox"
      :split-percentage="splitPercentage"
      :path="path"
      :minimum-pane-size-percentage="10"
      @release="handleResize($event, path, false)"
      @change="handleResize($event, path, true)"
    />

    <MosaicRootContent :node="node.second" :bounding-box="boundingBoxes.second" :path="path.concat('second')"> </MosaicRootContent>
  </template>
  <div v-else class="mosaic-tile absolute m-[3px]" :style="{ ...BoundingBox.asStyles(boundingBox) }">
    <MosaicWindow
      :node="node"
      :bounding-box="boundingBox"
      :path="path"
      :total-window-amount="getLeaves(mosaicRootActions.getRoot()).length"
    >
      <div :id="node.id"></div>
    </MosaicWindow>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { MosaicRootActionsKey } from "../symbols/Mosaic";
import { MosaicBranch, MosaicNode } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import { getLeaves, isParent } from "../utils/Mosaic";
import MosaicSplit from "./MosaicSplit.vue";
import MosaicWindow from "./MosaicWindow.vue";

const props = defineProps<{
  node: MosaicNode;
  boundingBox: BoundingBox;
  path: MosaicBranch[];
}>();

const mosaicRootActions = inject(MosaicRootActionsKey);
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
  if (!mosaicRootActions) return;

  mosaicRootActions.updateTree(
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
