import type { RouteRecordRaw } from 'vue-router'

// Rute modul Apras (anak pra sekolah 5–6 tahun) — didaftarkan di src/router/index.ts via spread.
export const aprasRoutes: RouteRecordRaw[] = [
  {
    path: '/apras',
    name: 'apras',
    component: () => import('@/modules/apras/views/AprasListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/apras/baru',
    name: 'apras-baru',
    component: () => import('@/modules/apras/views/AprasFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/apras/:id/edit',
    name: 'apras-edit',
    component: () => import('@/modules/apras/views/AprasFormView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/apras/:id',
    name: 'apras-detail',
    component: () => import('@/modules/apras/views/AprasDetailView.vue'),
    meta: { requiresAuth: true },
  },
]
