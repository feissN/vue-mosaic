<template>
  <template v-if="isParent(node)">
    <MosaicContent :node="node.first" :bounding-box="boundingBoxes!.first" :path="path.concat('first')">
      <template #content="contentProps">
        <slot name="content" v-bind="contentProps"></slot>
      </template>
    </MosaicContent>

    <MosaicSplit
      :direction="node.direction"
      :bounding-box="boundingBox"
      :split-percentage="splitPercentage"
      :path="path"
      :minimum-pane-size-percentage="10"
      @release="handleResize($event, path, false)"
      @change="handleResize($event, path, true)"
    />

    <MosaicContent :node="node.second" :bounding-box="boundingBoxes!.second" :path="path.concat('second')">
      <template #content="contentProps">
        <slot name="content" v-bind="contentProps"></slot>
      </template>
    </MosaicContent>
  </template>
  <div v-else class="mosaic-tile absolute m-[3px]" :style="{ ...BoundingBox.asStyles(boundingBox) }">
    <div class="w-full h-full overflow-hidden">
      <slot name="content" :node="node" :bounding-box="boundingBox" :path="path"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MosaicRootActionsKey } from "../symbols/Mosaic";
import { MosaicBranch, MosaicNode } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import { injectStrict } from "../utils/InjectStrict";
import { isParent } from "../utils/Mosaic";
import MosaicSplit from "./MosaicSplit.vue";

const props = defineProps<{
  node: MosaicNode;
  boundingBox: BoundingBox;
  path: MosaicBranch[];
}>();

const mosaicRootActions = injectStrict(MosaicRootActionsKey);
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
