<template>
  <div class="mosaic-root absolute inset-1">
    <MosaicRootContent :node="root" :bounding-box="BoundingBox.empty()" :path="[]"> </MosaicRootContent>
  </div>
</template>

<script setup lang="ts">
import { MosaicNode } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import MosaicRootContent from "./MosaicRootContent.vue";

const props = defineProps<{
  root: MosaicNode;
}>();
</script>
