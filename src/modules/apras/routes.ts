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
    // Konsolidasi form (v2.30.0): tambah/ubah hanya lewat modal di daftar.
    path: '/apras/baru',
    redirect: '/apras',
  },
  {
    path: '/apras/:id/edit',
    redirect: '/apras',
  },
  {
    path: '/apras/:id',
    name: 'apras-detail',
    component: () => import('@/modules/apras/views/AprasDetailView.vue'),
    meta: { requiresAuth: true },
  },
]
