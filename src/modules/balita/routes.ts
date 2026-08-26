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
    path: '/balita/rekap',
    name: 'balita-rekap',
    component: () => import('@/modules/balita/views/BalitaRekapView.vue'),
    meta: { requiresAuth: true },
  },
  {
    // Konsolidasi form (v2.30.0): tambah/ubah hanya lewat modal di daftar.
    path: '/balita/baru',
    redirect: '/balita',
  },
  {
    path: '/balita/:id/edit',
    redirect: '/balita',
  },
  {
    path: '/balita/:id',
    name: 'balita-detail',
    component: () => import('@/modules/balita/views/BalitaDetailView.vue'),
    meta: { requiresAuth: true },
  },
]