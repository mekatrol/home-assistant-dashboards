<template>
  <main>
    <pre>{{ homeAssistantEntities }}</pre>
  </main>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app-store';

const appStore = useAppStore();
const { homeAssistantEntities } = storeToRefs(appStore);
</script>
