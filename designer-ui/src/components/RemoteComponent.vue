<template>
  <div>
    <p v-if="!loaded">Loading component...</p>
    <cwc-default-web-component
      v-if="loaded"
      some-prop="hello"
    ></cwc-default-web-component>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getApiBaseUrl } from '@/services/url';

const loaded = ref(false);
const apiBaseUrl = getApiBaseUrl();
const name = 'DefaultComponent';
const componentUrl = `${apiBaseUrl}/components/${name}`;

onMounted(async () => {
  try {
    await loadWebComponent(componentUrl);
    loaded.value = true;
  } catch (e) {
    console.error(e);
  }
});

const loadWebComponent = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.onload = (): void => resolve();
    script.onerror = (): void => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(script);
  });
};
</script>
