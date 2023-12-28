<template>
  <div class="mosaic w-full h-full relative overflow-hidden">
    <div class="mosaic-root absolute inset-1">
      <MosaicContent v-if="root" :node="root" :bounding-box="BoundingBox.empty()" :path="[]">
        <template #content="contentProps">
          <slot name="content" v-bind="contentProps"></slot>
        </template>
      </MosaicContent>
      <div v-else class="w-full h-full">
        <slot name="empty">
          <div>
            <div>No Root</div>

            <div @click="handleAddPanel" class="p-2 bg-gray-500 hover:bg-gray-600 cursor-pointer">Add a new panel</div>
          </div>
        </slot>
      </div>
    </div>
  </div>
  <div>
    <div v-for="leave of leaves" :ref="(element) => handleAddLeaveElement(leave, element as HTMLElement)">
      <component :is="leave.component" :title="leave.title"></component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ComponentPublicInstance, computed, nextTick, onMounted, provide, ref, useSlots } from "vue";
import { MosaicDraggingSourcePathKey, MosaicIsDraggingKey, MosaicRootActionsKey } from "../symbols/Mosaic";
import { MosaicItem, MosaicNode, MosaicUpdate } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import { addMosaicNode, getLeaves } from "../utils/Mosaic";
import { createExpandUpdate, createHideUpdate, createRemoveUpdate, updateTree } from "../utils/MosaicUpdates";
import MosaicContent from "./MosaicContent.vue";
import MosaicEmpty from "./MosaicEmpty.vue";

const props = defineProps<{
  root: MosaicNode;
  newPanelComponent?: InstanceType<ComponentPublicInstance<any>>;
}>();

const emit = defineEmits<{
  (event: "release", node: MosaicNode | null): void;
  (event: "update:root", node: MosaicNode | null): void;
}>();

const slots = useSlots();

const customContent = computed(() => !!slots.content);

const replaceRoot = (currentNode: MosaicNode | null, suppressOnRelease: boolean = false) => {
  emit("update:root", currentNode);
  if (!suppressOnRelease) {
    emit("release", currentNode);
  }
};

const leaveElements = ref<{ id: string; element: HTMLElement }[]>([]);
const leaves = ref<MosaicItem[]>([]);

const handleAddLeaveElement = (leave: MosaicItem, element: HTMLElement) => {
  if (leaveElements.value.find((element) => element.id === leave.id)) return;
  leaveElements.value.push({ id: leave.id, element: element.children[0] as HTMLElement });
};

const updateTreeFromRoot = async (updates: MosaicUpdate[], suppressOnRelease: boolean = false, refreshPortals: boolean = false) => {
  const currentNode = props.root || ({} as MosaicNode);

  const updatedRoot = updateTree(currentNode, updates);
  replaceRoot(updatedRoot, suppressOnRelease);

  if (refreshPortals && !customContent.value) {
    handleSetPortalItems();
  }
};

provide(MosaicRootActionsKey, {
  updateTree: updateTreeFromRoot,
  getRoot: () => props.root,
  expand(path, percentage) {
    updateTreeFromRoot([createExpandUpdate(path, percentage || 50)]);
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

const handleSetPortalItems = async () => {
  await nextTick();

  leaveElements.value.forEach((element) => {
    const portalDiv = document.getElementById(element.id);
    if (!portalDiv) return;
    if (!element.element) return;

    portalDiv.appendChild(element.element as unknown as Node);
  });
};

const handleAddPanel = () => {
  const newRoot = addMosaicNode(props.root, props.newPanelComponent || MosaicEmpty);
  //   leaves.value = getLeaves(newRoot);
  replaceRoot(newRoot);
  handleSetPortalItems();
};

defineExpose({
  handlePanelUpdate: handleSetPortalItems,
});

onMounted(() => {
  if (customContent.value) return;
  leaves.value = getLeaves(props.root);
  handleSetPortalItems();
});
</script>
