<template>
  <router-link
    class="router-link"
    :to="{ path: `/${ROUTE_DASHBOARD_VIEW}/home` }"
    >Go to dashboard</router-link
  >
</template>

<script setup lang="ts">
import { ROUTE_DASHBOARD_VIEW } from '@/router';
</script>
