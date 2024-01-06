<template>
  <div class="mosaic w-full h-full relative overflow-hidden">
    <div class="mosaic-root absolute inset-1">
      <MosaicContent v-if="root" :node="root" :bounding-box="BoundingBox.empty()" :path="[]">
        <template #content="contentProps">
          <MosaicWindow v-bind="contentProps" @dropped="handleDropped" :title="getWindowTitle(contentProps.node as string)">
            <MosaicTarget v-bind="contentProps" />
          </MosaicWindow>
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
</template>

<script setup lang="ts">
import { ComponentPublicInstance, RendererElement, RendererNode, VNode, createApp, nextTick, onMounted, provide, ref, watch } from "vue";
import {
  MosaicContextActionsProviderKey,
  MosaicContextActiveLeavesKey,
  MosaicContextAllLeavesKey,
  MosaicContextInactiveLeavesKey,
  MosaicRootActionsKey,
} from "../symbols/Mosaic";
import { MosaicItem, MosaicNode, MosaicRootActions, MosaicUpdate } from "../types/Mosaic";
import { BoundingBox } from "../utils/BoundingBox";
import { injectStrict } from "../utils/InjectStrict";
import { addMosaicNode, getLeaves } from "../utils/Mosaic";
import { createExpandUpdate, createHideUpdate, createRemoveUpdate, updateTree } from "../utils/MosaicUpdates";
import MosaicContent from "./MosaicContent.vue";
import MosaicPanel from "./MosaicPanel.vue";
import MosaicTarget from "./MosaicTarget.vue";
import MosaicWindow from "./MosaicWindow.vue";

const props = defineProps<{
  root: MosaicNode | null;
  newPanelComponent?: InstanceType<ComponentPublicInstance<any>>;
  inactiveTarget?: string;
}>();

const emit = defineEmits<{
  (event: "release", node: MosaicNode | null): void;
  (event: "update:root", node: MosaicNode | null): void;
  (event: "addItem", key: MosaicItem, title: string): void;
}>();

type Slot = VNode<
  RendererNode,
  RendererElement,
  {
    [key: string]: any;
  }
>;

const slots = defineSlots<{
  empty(): Slot;
  default(): Slot[];
  inactive(props: { key: string; title: string }): [Slot];
}>();

const allLeaves = injectStrict(MosaicContextAllLeavesKey);
const inactiveLeaves = injectStrict(MosaicContextInactiveLeavesKey);
const activeLeaves = injectStrict(MosaicContextActiveLeavesKey);

const replaceRoot = (currentNode: MosaicNode | null, suppressOnRelease: boolean = false) => {
  emit("update:root", currentNode);
  if (!suppressOnRelease) {
    emit("release", currentNode);
  }
};

const handleDropped = async () => {
  await nextTick();
  const newLeaves = getLeaves(props.root);
  activeLeaves.value = newLeaves;
  inactiveLeaves.value = allLeaves.value.filter(({ key }) => !activeLeaves.value.includes(key)).map(({ key }) => key);
};

const handleAddPanel = async () => {
  const newKey = crypto.randomUUID();
  const newTitle = "Jetzt neu!";
  const newRoot = addMosaicNode(props.root, newKey);
  replaceRoot(newRoot);
  allLeaves.value.push({
    key: newKey,
    title: newTitle,
  });
  emit("addItem", newKey, newTitle);
  activeLeaves.value = getLeaves(newRoot);
  inactiveLeaves.value = allLeaves.value.filter(({ key }) => !activeLeaves.value.includes(key)).map(({ key }) => key);
  //   handleMount
  await nextTick();
  handleUpdateMosaicDom();
};

const updateTreeFromRoot = async (updates: MosaicUpdate[], suppressOnRelease: boolean = false) => {
  const currentNode = props.root || ({} as MosaicNode);

  const updatedRoot = updateTree(currentNode, updates);
  replaceRoot(updatedRoot, suppressOnRelease);
};

const mosaicRootActions: MosaicRootActions = {
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
};
provide(MosaicRootActionsKey, mosaicRootActions);

const mosaicContextActions = injectStrict(MosaicContextActionsProviderKey);
mosaicContextActions.updateTree = mosaicRootActions.updateTree;
mosaicContextActions.getRoot = mosaicRootActions.getRoot;
mosaicContextActions.expand = mosaicRootActions.expand;
mosaicContextActions.hide = mosaicRootActions.hide;
mosaicContextActions.remove = mosaicRootActions.remove;
mosaicContextActions.replaceWith = mosaicRootActions.replaceWith;
mosaicContextActions.handleAddPanel = handleAddPanel;

const availableSlotComponents = ref<{ key: string; component: InstanceType<typeof MosaicPanel> }[]>([]);

const getWindowTitle = (key: string) => {
  const foundComponent = availableSlotComponents.value.find((element) => element.key === key);

  if (!foundComponent) return "";

  return foundComponent.component.windowTitle;
};

const handleSlots = () => {
  if (!slots.default) return;

  const defaultSlots = slots.default();

  const flatDefaultSlots = defaultSlots
    .map((slot) => {
      if (slot.type.toString() === Symbol("v-fgt").toString()) {
        return slot.children as Slot[];
      }
      return slot;
    })
    .flat();

  flatDefaultSlots.forEach((slot) => {
    if (slot.key === null || slot.key === undefined) {
      return;
    }
    if (!(typeof slot.type === "object" && "__name" in slot.type && slot.type.__name === "MosaicPanel")) {
      console.warn('[Mosaic] Props need to use the "<MosaicPanel>" Component');
      return;
    }

    const slotComponent = createApp(slot).mount(document.createElement("div"));
    availableSlotComponents.value.push({ key: slot.key as string, component: slotComponent as InstanceType<typeof MosaicPanel> });
  });

  handleUpdateMosaicDom();
};

const handleUpdateMosaicDom = () => {
  if (!availableSlotComponents.value?.length) return;

  availableSlotComponents.value.forEach(({ component, key }) => {
    const target = document.getElementById(`target-node-${key}`);
    if (target) {
      target.appendChild(component.$el);
      return;
    }
  });
};

watch(
  () => activeLeaves.value,
  () => {
    handleUpdateMosaicDom();
  }
);

function compareArrays<T, U>(arr1: T[], arr2: U[], key: keyof T & keyof U) {
  // Create maps to store items based on the key
  const map1 = new Map(arr1.map((item) => [item[key], item]));
  const map2 = new Map(arr2.map((item) => [item[key], item]));

  // Find added and removed items
  const addedItems = arr2.filter((item2) => !map1.has(item2[key] as unknown as T[keyof T & keyof U]));
  const removedItems = arr1.filter((item1) => !map2.has(item1[key] as unknown as U[keyof T & keyof U]));

  return { addedItems, removedItems };
}

const handleSlotsUpdated = () => {
  const defaultSlots = slots.default();

  const flatDefaultSlots = defaultSlots
    .map((slot) => {
      if (slot.type.toString() === Symbol("v-fgt").toString()) {
        return slot.children as Slot[];
      }
      return slot;
    })
    .flat();

  const changes = compareArrays(availableSlotComponents.value, flatDefaultSlots, "key");

  if (changes.addedItems) {
    changes.addedItems.forEach((slot) => {
      if (slot.key === null || slot.key === undefined) {
        return;
      }
      if (!(typeof slot.type === "object" && "__name" in slot.type && slot.type.__name === "MosaicPanel")) {
        console.warn('[Mosaic] Props need to use the "<MosaicPanel>" Component');
        return;
      }

      const slotComponent = createApp(slot).mount(document.createElement("div")) as InstanceType<typeof MosaicPanel>;
      availableSlotComponents.value.push({ key: slot.key as string, component: slotComponent });
      allLeaves.value.push({
        key: String(slot.key),
        title: slotComponent.windowTitle,
      });

      if (activeLeaves.value.includes(String(slot.key))) {
        console.log("idk");
      } else {
        inactiveLeaves.value.push(String(slot.key));
      }
    });
  }
  if (changes.removedItems) {
    changes.removedItems.forEach((item) => {
      const foundIndex = availableSlotComponents.value.findIndex(({ key }) => String(key) === String(item.key));
      if (foundIndex === -1) return;

      item.component.$.appContext.app.unmount();

      availableSlotComponents.value.splice(foundIndex, 1);
      allLeaves.value = allLeaves.value.filter((leave) => leave.key !== item.key);
      inactiveLeaves.value = inactiveLeaves.value.filter((leave) => leave !== item.key);
    });
  }
};

watch(
  () => slots.default?.(),
  () => {
    console.log("slots update")
    handleSlotsUpdated();
  }
);

onMounted(() => {
  handleSlots();

  allLeaves.value = availableSlotComponents.value.map((item) => ({ key: item.key, title: item.component.windowTitle }));

  activeLeaves.value = getLeaves(props.root);
  inactiveLeaves.value = allLeaves.value.filter(({ key }) => !activeLeaves.value.includes(key)).map(({ key }) => key);
});
</script>
