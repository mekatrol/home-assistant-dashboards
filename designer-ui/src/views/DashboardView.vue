<template>
  <main>
    <DashboardLayout
      v-if="dashboardName"
      :name="dashboardName"
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouteHelper } from '@/composables/route-helper';
import { ROUTE_DASHBOARD_VIEW } from '@/router';
import DashboardLayout from '@/components/DashboardLayout.vue';

const dashboardName = computed(() => {
  const parts = useRouteHelper().urlPathParts();

  // This must be a dashboard view
  if (parts.length < 2 || parts[0] != ROUTE_DASHBOARD_VIEW) {
    return undefined;
  }

  return parts[1];
});
</script>
