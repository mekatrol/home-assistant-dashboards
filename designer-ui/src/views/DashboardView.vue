<template>
  <main>
    <DashboardLayout
      v-if="dashboardName"
      :name="dashboardName"
    />
    <div v-else>
      <p class="error-box">ERROR: The dashboard view is being displayed for a path that does not start with the URL '{{ `/${ROUTE_DASHBOARD}` }}'.</p>

      <p>
        <router-link
          class="router-link"
          :to="{ name: ROUTE_INDEX }"
          >Go to index</router-link
        >
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouteHelper } from '@/composables/route-helper';
import { ROUTE_DASHBOARD, ROUTE_INDEX } from '@/router';
import DashboardLayout from '@/components/DashboardLayout.vue';

const dashboardName = computed(() => {
  try {
    const parts = useRouteHelper().urlPathParts();

    // This must be a dashboard view
    if (parts.length < 2 || parts[0] != ROUTE_DASHBOARD) {
      return undefined;
    }

    return parts[1];
  } catch {
    // Any path errors just return undefined to display error
    return undefined;
  }
});
</script>
