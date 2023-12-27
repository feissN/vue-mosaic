<template>
  <div class="mosaic w-full h-full relative">
    <MosaicRoot :root="(root as MosaicNode<T>)">
      <template #renderer="{ boundingBox, node, path }">
        <slot name="renderer" :node="node" :path="path" :bounding-box="boundingBox"> </slot>
      </template>
    </MosaicRoot>
  </div>
</template>

<script setup lang="ts" generic="T extends MosaicKey">
import { provide } from "vue";
import { UpdateTreeKey } from "../symbols/Mosaic";
import { MosaicKey, MosaicNode, MosaicUpdate } from "../types/Mosaic";
import { updateTree } from "../utils/Mosaic";
import MosaicRoot from "./MosaicRoot.vue";

const props = defineProps<{
  root: MosaicNode<T>;
}>();

const emit = defineEmits<{
  (event: "change", node: MosaicNode<T>): void;
  (event: "release", node: MosaicNode<T>): void;
  (event: "update:root", node: MosaicNode<T>): void;
}>();

const replaceRoot = (currentNode: MosaicNode<T> | null, suppressOnRelease: boolean = false) => {
  emit("change", currentNode);
  emit("update:root", currentNode);
  if (!suppressOnRelease) {
    emit("release", currentNode);
  }
};

const updateTreeFromRoot = (updates: MosaicUpdate<T>[], suppressOnRelease: boolean = false) => {
  const currentNode = props.root || ({} as MosaicNode<T>);

  replaceRoot(updateTree(currentNode, updates), suppressOnRelease);
};

provide(UpdateTreeKey, updateTreeFromRoot);
</script>
