<template>
  <div class="bg-gray-900 h-screen text-white flex flex-col">
    <div class="p-4 flex-1 bg-gray-800 flex gap-2">
      <MosaicContext :all-items="allItems">
        <MosaicDropzone>
          <MosaicDraggable v-for="item in allItems" v-bind="item"></MosaicDraggable>
        </MosaicDropzone>

        <Mosaic ref="mosaicRef" v-model:root="root" @release="handleSaveChange"> </Mosaic>
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
import Hello from "./components/previews/Hello.vue";
import { MosaicItem, MosaicNode } from "./types/Mosaic";

const allItems = ref<MosaicItem[]>([
  { id: "hello1", component: Hello, title: "Hello 1" },
  { id: "hello2", component: Hello, title: "Hello 2" },
  { id: "hello3", component: Hello, title: "Hello 3" },
  { id: "hello4", component: Hello, title: "Hello 4" },
  { id: "hello5", component: Hello, title: "Sidebar" },
]);

const root = ref<MosaicNode>({
  direction: "row",
  first: allItems.value[0],
  second: {
    direction: "column",
    first: {
      direction: "row",
      first: allItems.value[1],
      second: allItems.value[2],
      splitPercentage: 70,
    },
    second: allItems.value[3],
  },
  splitPercentage: 40,
});

const mosaicRef = ref<InstanceType<typeof Mosaic>>();

const handleSaveChange = (updatedNode: MosaicNode | null) => {
  // Handle update on save
};
</script>
