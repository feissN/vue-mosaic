<template>
  <div :id="`target-node-${node}`"></div>
</template>

<script setup lang="ts">
import { MosaicBranch, MosaicItem } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";

const props = defineProps<{
  node: MosaicItem;
  boundingBox: BoundingBox;
  path: MosaicBranch[];
}>();
</script>
