<template>
  <div class="bg-gray-900 h-screen text-white flex flex-col">
    <div class="p-4 flex-1 bg-gray-800 flex gap-2">
      <MosaicContext :root="root">
        <div class="bg-gray-700 w-24 h-full p-1 flex flex-col gap-2">
          <MosaicDraggable :title="'Counter'"></MosaicDraggable>
        </div>

        <Mosaic ref="mosaicRef" v-model:root="root" @release="handleSaveChange"> </Mosaic>
      </MosaicContext>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Mosaic from "./components/Mosaic.vue";
import Hello from "./components/previews/Hello.vue";
import { MosaicNode } from "./types/Mosaic";
import MosaicDraggable from "./components/MosaicDraggable.vue";
import MosaicContext from "./components/MosaicContext.vue";

const root = ref<MosaicNode>({
  direction: "row",
  first: { id: "hello1", component: Hello, title: "Hello 1" },
  second: {
    direction: "column",
    first: {
      direction: "row",
      first: { id: "hello2", component: Hello, title: "Hello 2" },
      second: { id: "hello3", component: Hello, title: "Hello 3" },
      splitPercentage: 70,
    },
    second: { id: "hello4", component: Hello, title: "Hello 4" },
  },
  splitPercentage: 40,
});

const mosaicRef = ref<InstanceType<typeof Mosaic>>();

const handleSaveChange = (updatedNode: MosaicNode | null) => {
  // Handle update on save
};
</script>
