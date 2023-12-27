<template>
  <div class="bg-gray-900 h-screen text-white flex flex-col">
    <div>Mosaic test</div>
    <div class="p-4 flex-1 bg-gray-800">
      <Mosaic v-model:root="root" @release="handleSaveChange" v-slot="{ boundingBox, node, path }">
        <MosaicWindow :node="node" :bounding-box="boundingBox" :path="path">
          <div>
            Node:
            <pre>{{ node }}</pre>
          </div>
          <br />
          <div>
            boundingBox:
            <pre>{{ boundingBox }}</pre>
          </div>
          <br />
          <div>
            path:
            <pre>{{ path }}</pre>
          </div>
        </MosaicWindow>
      </Mosaic>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Mosaic from "./components/Mosaic.vue";
import MosaicWindow from "./components/MosaicWindow.vue";
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

const handleSaveChange = (updatedNode: MosaicNode<string>) => {
  console.log("Save changes", updatedNode);
};
</script>
