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
    path: '/bumil/rekap',
    name: 'bumil-rekap',
    component: () => import('@/modules/bumil/views/BumilRekapView.vue'),
    meta: { requiresAuth: true },
  },
  {
    // Konsolidasi form (v2.30.0): tambah/ubah hanya lewat modal di daftar.
    path: '/bumil/baru',
    redirect: '/bumil',
  },
  {
    path: '/bumil/:id/edit',
    redirect: '/bumil',
  },
  {
    path: '/bumil/:id',
    name: 'bumil-detail',
    component: () => import('@/modules/bumil/views/BumilDetailView.vue'),
    meta: { requiresAuth: true },
  },
]