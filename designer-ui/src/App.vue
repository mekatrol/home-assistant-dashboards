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
import { closeWebSocket, useServerUpdateWebSocket } from './services/web-socket';

import BusyOverlay from '@/components/BusyOverlay.vue';
import MessageOverlay from '@/components/MessageOverlay.vue';

const appStore = useAppStore();
const { messageData, isBusy } = storeToRefs(appStore);

onMounted(() => {
  // Make sure websockets active
  useServerUpdateWebSocket();
});

onBeforeUnmount(() => {
  closeWebSocket();
});
</script>
