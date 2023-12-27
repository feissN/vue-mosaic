<template>
  <div class="mosaic w-full h-full relative overflow-hidden">
    <MosaicRoot :root="(root as MosaicNode<T>)">
      <template #default="{ boundingBox, node, path }">
        <slot name="default" :node="node" :path="path" :bounding-box="boundingBox"> </slot>
      </template>
    </MosaicRoot>
  </div>
</template>

<script setup lang="ts" generic="T extends MosaicKey">
import { provide, ref } from "vue";
import { MosaicDraggingSourcePathKey, MosaicIsDraggingKey, MosaicRootActionsKey } from "../symbols/Mosaic";
import { MosaicKey, MosaicNode, MosaicUpdate } from "../types/Mosaic";
import { createExpandUpdate, createHideUpdate, createRemoveUpdate, updateTree } from "../utils/MosaicUpdates";
import MosaicRoot from "./MosaicRoot.vue";

const props = defineProps<{
  root: MosaicNode<T>;
}>();

const emit = defineEmits<{
  (event: "release", node: MosaicNode<T>): void;
  (event: "update:root", node: MosaicNode<T>): void;
}>();

const replaceRoot = (currentNode: MosaicNode<T> | null, suppressOnRelease: boolean = false) => {
  emit("update:root", currentNode);
  if (!suppressOnRelease) {
    emit("release", currentNode);
  }
};

const updateTreeFromRoot = (updates: MosaicUpdate<T>[], suppressOnRelease: boolean = false) => {
  const currentNode = props.root || ({} as MosaicNode<T>);

  replaceRoot(updateTree(currentNode, updates), suppressOnRelease);
};

provide(MosaicRootActionsKey, {
  updateTree: updateTreeFromRoot,
  getRoot: () => props.root,
  expand(path, percentage) {
    updateTreeFromRoot([createExpandUpdate<T>(path, percentage)]);
  },
  hide(path) {
    updateTreeFromRoot([createHideUpdate<T>(path)]);
  },
  remove(path) {
    if (path.length === 0) {
      replaceRoot(null);
    } else {
      updateTreeFromRoot([createRemoveUpdate(this.getRoot(), path)]);
    }
  },
  replaceWith(path, node) {
    updateTreeFromRoot([
      {
        path,
        spec: {
          $set: node,
        },
      },
    ]);
  },
});

const isDragging = ref(false);
provide(MosaicIsDraggingKey, isDragging);

const draggingSourcePath = ref([]);
provide(MosaicDraggingSourcePathKey, draggingSourcePath);
</script>
