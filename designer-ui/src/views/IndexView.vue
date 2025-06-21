<template>
  <router-link
    class="index-link"
    :to="{ path: `/${ROUTE_DASHBOARD_VIEW}/home` }"
    >Go to dashboard</router-link
  >
</template>

<script setup lang="ts">
import { ROUTE_DASHBOARD_VIEW } from '@/router';
</script>

<style lang="css" scoped>
.index-link {
  margin-inline: 2rem;
  margin-block: 1rem;
}
</style>
