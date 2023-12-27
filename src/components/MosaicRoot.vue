<template>
  <div class="mosaic-root absolute inset-1">
    <MosaicRootContent :node="(root as MosaicNode<MosaicKey>)" :bounding-box="BoundingBox.empty()" :path="[]">
      <template #default="{ boundingBox, node, path }">
        <slot name="default" :node="node" :path="path" :bounding-box="boundingBox"> </slot>
      </template>
    </MosaicRootContent>
  </div>
</template>

<script setup lang="ts" generic="T extends MosaicKey">
import { MosaicKey, MosaicNode } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import MosaicRootContent from "./MosaicRootContent.vue";

const props = defineProps<{
  root: MosaicNode<T>;
}>();
</script>
