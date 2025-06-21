import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import IndexView from '../views/IndexView.vue';

export const ROUTE_DASHBOARD_VIEW = 'dashboard';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexView
    },
    {
      path: `/${ROUTE_DASHBOARD_VIEW}/:pathMatch(.*)*`, // Dashboard catch-all route
      name: ROUTE_DASHBOARD_VIEW,
      component: DashboardView
    }
  ]
});

export default router;
