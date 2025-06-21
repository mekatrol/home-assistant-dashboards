<template>
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
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app-store';
import { RouterView } from 'vue-router';
import { homeAssistantConnect, homeAssistantClose } from './services/home-assistant';

import BusyOverlay from '@/components/BusyOverlay.vue';
import MessageOverlay from '@/components/MessageOverlay.vue';

const appStore = useAppStore();
const { messageData, isBusy } = storeToRefs(appStore);

onMounted(async () => {
  // Make sure home assistant websocket active
  try {
    await homeAssistantConnect();
  } catch (err: unknown) {
    console.error(err);
  }
});

onBeforeUnmount(() => {
  homeAssistantClose();
});
</script>
