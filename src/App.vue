<template>
  <div class="bg-gray-900 h-screen text-white flex flex-col">
    <div class="p-4 flex-1 bg-gray-800">
      <Mosaic v-model:root="root" @release="handleSaveChange"> </Mosaic>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Mosaic from "./components/Mosaic.vue";
import { MosaicNode } from "./types/Mosaic";
import Hello from "./components/previews/Hello.vue";

const root = ref<MosaicNode>({
  direction: "row",
  first: { component: Hello, title: "Hello 1" },
  second: {
    direction: "column",
    first: {
      direction: "row",
      first: { component: Hello, title: "Hello 2" },
      second: { component: Hello, title: "Hello 3" },
      splitPercentage: 70,
    },
    second: { component: Hello, title: "Hello 4" },
  },
  splitPercentage: 40,
});

const handleSaveChange = (updatedNode: MosaicNode) => {
  console.log("Save changes", updatedNode);
};
</script>
