import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import IndexView from '../views/IndexView.vue';

export const ROUTE_INDEX = 'index';
export const ROUTE_DASHBOARD = 'dashboard';
export const ROUTE_NOT_FOUND = 'notfound';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_INDEX,
      component: IndexView
    },
    {
      path: `/${ROUTE_DASHBOARD}/:pathMatch(.*)*`, // Dashboard catch-all route
      name: ROUTE_DASHBOARD,
      component: DashboardView
    },
    {
      path: '/:pathMatch(.*)*', // Final catch-all route
      name: ROUTE_NOT_FOUND,
      redirect: { name: ROUTE_INDEX }
    }
  ]
});

export default router;
