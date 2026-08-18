import type { RouteRecordRaw } from 'vue-router'

// Rute modul Bumil — didaftarkan di src/router/index.ts via spread.
export const bumilRoutes: RouteRecordRaw[] = [
  {
    path: '/bumil',
    name: 'bumil',
    component: () => import('@/modules/bumil/views/BumilListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/bumil/baru',
    name: 'bumil-baru',
    component: () => import('@/modules/bumil/views/BumilFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/bumil/:id/edit',
    name: 'bumil-edit',
    component: () => import('@/modules/bumil/views/BumilFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/bumil/:id',
    name: 'bumil-detail',
    component: () => import('@/modules/bumil/views/BumilDetailView.vue'),
    meta: { requiresAuth: true },
  },
]