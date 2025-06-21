import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import IndexView from '../views/IndexView.vue';

export const ROUTE_INDEX_VIEW = 'index';
export const ROUTE_DASHBOARD_VIEW = 'dashboard';
export const ROUTE_NOT_FOUND_VIEW = 'not-found';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_INDEX_VIEW,
      component: IndexView
    },
    {
      path: `/${ROUTE_DASHBOARD_VIEW}/:pathMatch(.*)*`, // Dashboard catch-all route
      name: ROUTE_DASHBOARD_VIEW,
      component: DashboardView
    },
    {
      path: '/:pathMatch(.*)*', // Final catch-all route
      name: ROUTE_NOT_FOUND_VIEW,
      component: IndexView
    }
  ]
});

export default router;
