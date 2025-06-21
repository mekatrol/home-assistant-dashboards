<template>
  <main>
    <DashboardLayout :name="dashboardName" />
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
  if (parts.lenth < 2 || parts[0] != ROUTE_DASHBOARD_VIEW) {
    return '';
  }

  return parts[1];
});
</script>
