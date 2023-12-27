<template>
  <div class="bg-gray-900 h-screen text-white">
    <div>Mosaic test</div>
    <div class="p-4 h-[500px] bg-gray-800">
      <Mosaic :root="root" @change="handleChange" @release="handleSaveChange">
        <template #renderer="{ boundingBox, node, path }">
          <div class="bg-gray-700 w-full h-full p-2 overflow-auto">
            <div>Ja mooooin</div>
            <div>{{ node }}</div>
            <div>{{ path }}</div>
          </div>
        </template>
      </Mosaic>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Mosaic from "./components/Mosaic.vue";
import { MosaicNode } from "./types/Mosaic";

const root = ref<MosaicNode<string>>({
  direction: "row",
  first: "hello",
  second: {
    direction: "column",
    first: {
      direction: "row",
      first: "wtf",
      second: "gg",
      splitPercentage: 70,
    },
    second: "LOL",
  },
  splitPercentage: 40,
});

const handleChange = (updatedNode: MosaicNode<string>) => {
  root.value = updatedNode;
};

const handleSaveChange = (updatedNode: MosaicNode<string>) => {
  console.log("Save changes", updatedNode);
};
</script>