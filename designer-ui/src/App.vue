<template>
  <div
    class="container"
    ref="container"
  >
    <BusyOverlay
      :show="isBusy"
      full-screen
    />
    <MessageOverlay
      :show="!!messageData"
      :data="messageData"
      full-screen
    />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app-store';
import { RouterView } from 'vue-router';
import { homeAssistantConnect, homeAssistantClose } from './services/home-assistant';

import BusyOverlay from '@/components/BusyOverlay.vue';
import MessageOverlay from '@/components/MessageOverlay.vue';
import { updateHassEntities } from './services/web-component';

const container = ref<HTMLElement>();
const appStore = useAppStore();
const { messageData, isBusy } = storeToRefs(appStore);

onMounted(async () => {
  // Make sure home assistant websocket active
  try {
    await homeAssistantConnect(container.value!);
  } catch (err: unknown) {
    console.error(err);
  }
});

onBeforeUnmount(() => {
  homeAssistantClose();
});

watch(
  () => appStore.homeAssistantEntities,
  (entities) => {
    if (container.value) {
      updateHassEntities(container.value, entities);
    }
  },
  { immediate: true }
);
</script>
