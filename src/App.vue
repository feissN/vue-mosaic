<template>
  <div class="bg-gray-900 h-screen text-white flex flex-col">
    <div class="p-4 flex-1 bg-gray-800 flex gap-2">
      <MosaicContext>
        <MosaicDropzone id="mosaic-inactive-items" @add="handleAddNewItem">
          <template #item="{ id, key, title }">
            <MosaicDraggable :key="key" :id="id" :title="title" @delete="handleDelete(key)"></MosaicDraggable>
          </template>
        </MosaicDropzone>

        <Mosaic v-model:root="root" inactive-target="#mosaic-inactive-items" @release="handleSaveChange" @add-item="handleAddItem">
          <MosaicPanel v-for="item in items" :key="item.key" :window-title="item.title">
            {{ item.key }}
            <Hello />
          </MosaicPanel>
        </Mosaic>
      </MosaicContext>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Mosaic from "./components/Mosaic.vue";
import MosaicContext from "./components/MosaicContext.vue";
import MosaicDraggable from "./components/MosaicDraggable.vue";
import MosaicDropzone from "./components/MosaicDropzone.vue";
import MosaicPanel from "./components/MosaicPanel.vue";
import Hello from "./components/previews/Hello.vue";
import { MosaicItem, MosaicNode } from "./types/Mosaic";

const items = ref<
  {
    key: string;
    title: string;
  }[]
>([
  {
    key: "1",
    title: "Testing 1",
  },
  {
    key: "2",
    title: "Testing 2",
  },
  {
    key: "3",
    title: "Testing 3",
  },
  {
    key: "4",
    title: "Testing 4",
  },
  {
    key: "5",
    title: "Testing 5",
  },
  {
    key: "6",
    title: "Testing 6",
  },
]);

const root = ref<MosaicNode>({
  direction: "row",
  first: "1",
  second: {
    direction: "column",
    first: {
      direction: "row",
      first: "2",
      second: "3",
      splitPercentage: 70,
    },
    second: "4",
  },
  splitPercentage: 40,
});

const handleSaveChange = (updatedNode: MosaicNode | null) => {
  // Handle update on save
};

const handleAddItem = (newKey: MosaicItem, newTitle: string) => {
  items.value.push({
    key: String(newKey),
    title: newTitle,
  });
};

const handleAddNewItem = () => {
  handleAddItem(crypto.randomUUID(), "Neu von sidebar");
};

const handleDelete = (key: MosaicItem) => {
  items.value = items.value.filter((item) => String(item.key) !== String(key));
};
</script>
