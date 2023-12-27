<template>
  <div class="mosaic w-full h-full relative overflow-hidden">
    <MosaicRoot :root="root"> </MosaicRoot>
  </div>
  <div>
    <div
      v-for="leave of leaves"
      :ref="(element) => leaveElements.push({id:leave.id, element: (element as HTMLElement).children[0] as HTMLElement})"
    >
      <component :is="leave.component" :title="leave.title"></component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, provide, ref } from "vue";
import { MosaicDraggingSourcePathKey, MosaicIsDraggingKey, MosaicRootActionsKey } from "../symbols/Mosaic";
import { MosaicItem, MosaicNode, MosaicUpdate } from "../types/Mosaic";
import { getLeaves } from "../utils/Mosaic";
import { createExpandUpdate, createHideUpdate, createRemoveUpdate, updateTree } from "../utils/MosaicUpdates";
import MosaicRoot from "./MosaicRoot.vue";

const props = defineProps<{
  root: MosaicNode;
}>();

const emit = defineEmits<{
  (event: "release", node: MosaicNode): void;
  (event: "update:root", node: MosaicNode): void;
}>();

const replaceRoot = (currentNode: MosaicNode | null, suppressOnRelease: boolean = false) => {
  emit("update:root", currentNode);
  if (!suppressOnRelease) {
    emit("release", currentNode);
  }
};

const leaveElements = ref<{ id: string; element: HTMLElement }[]>([]);
const leaves = ref<MosaicItem[]>([]);

const updateTreeFromRoot = (updates: MosaicUpdate[], suppressOnRelease: boolean = false, refreshPortals: boolean = false) => {
  const currentNode = props.root || ({} as MosaicNode);

  replaceRoot(updateTree(currentNode, updates), suppressOnRelease);

  if (refreshPortals) {
    handleSetPortalItems();
  }
};

provide(MosaicRootActionsKey, {
  updateTree: updateTreeFromRoot,
  getRoot: () => props.root,
  expand(path, percentage) {
    updateTreeFromRoot([createExpandUpdate(path, percentage)]);
  },
  hide(path) {
    updateTreeFromRoot([createHideUpdate(path)]);
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

const handleSetPortalItems = async () => {
  await nextTick();

  leaveElements.value.forEach((element) => {
    const portalDiv = document.getElementById(element.id);
    if (!portalDiv) return;

    portalDiv.appendChild(element.element as unknown as Node);
  });
};

onMounted(() => {
  leaves.value = getLeaves(props.root);
  handleSetPortalItems();
});
</script>
