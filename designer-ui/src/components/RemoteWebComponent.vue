<template>
  <p v-if="!loaded">Loading component '{{ name }}'...</p>
  <component
    :is="tagName"
    v-else-if="loaded && !loadError"
  ></component>
  <p v-else-if="loadError">Error loading component '{{ name }}'...</p>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { loadWebComponent, CWC_PREFIX } from '@/services/web-component';

const props = defineProps<{
  name: string;
}>();

const tagName = computed(() => `${CWC_PREFIX}${props.name}`);

const loaded = ref(false);
const loadError = ref(false);

onMounted(async () => {
  await loadWebComponent(props.name, (loadFailed) => {
    loadError.value = loadFailed;
    loaded.value = true;
  });
});
</script>
