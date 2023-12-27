<template>
  <div class="bg-gray-500 p-1 h-full flex flex-col gap-4">
    <div>Result: {{ count }}</div>
    <div class="flex items-center w-full gap-2">
      <button type="button" class="p-1 bg-gray-700 cursor-pointer hover:brightness-90 flex-1" @click="handlePlus">+</button>
      <button type="button" class="p-1 bg-gray-700 cursor-pointer hover:brightness-90 flex-1" @click="handleMinus">-</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { MosaicItem } from "../../types/Mosaic";

const props = defineProps<{
  node: MosaicItem;
}>();

const count = ref(0);
const handlePlus = () => {
  count.value++;
};
const handleMinus = () => {
  count.value--;
};

onMounted(() => {
  console.log("mounted", props.node.title);
});

onUnmounted(() => {
  console.log("unmounted", props.node.title);
});
</script>
