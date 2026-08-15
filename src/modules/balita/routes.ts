import type { RouteRecordRaw } from 'vue-router'

// Rute modul Balita — didaftarkan di src/router/index.ts via spread.
// Modul lain cukup menyediakan array routes serupa (konvensi src/modules/<modul>/routes.ts).
export const balitaRoutes: RouteRecordRaw[] = [
  {
    path: '/balita',
    name: 'balita',
    component: () => import('@/modules/balita/views/BalitaListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/balita/baru',
    name: 'balita-baru',
    component: () => import('@/modules/balita/views/BalitaFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/balita/:id/edit',
    name: 'balita-edit',
    component: () => import('@/modules/balita/views/BalitaFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/balita/:id',
    name: 'balita-detail',
    component: () => import('@/modules/balita/views/BalitaDetailView.vue'),
    meta: { requiresAuth: true },
  },
]