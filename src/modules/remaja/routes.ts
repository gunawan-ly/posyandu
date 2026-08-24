import type { RouteRecordRaw } from 'vue-router'

// Rute modul Remaja (usia sekolah & remaja 7–18 tahun) — didaftarkan di src/router/index.ts via spread.
// Fase placeholder: detail & edit masih diarahkan ke daftar; struktur tabel menyusul batch berikutnya.
export const remajaRoutes: RouteRecordRaw[] = [
  {
    path: '/remaja',
    name: 'remaja',
    component: () => import('@/modules/remaja/views/RemajaListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/remaja/baru',
    name: 'remaja-baru',
    component: () => import('@/modules/remaja/views/RemajaListView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/remaja/:id/edit',
    name: 'remaja-edit',
    redirect: { name: 'remaja' },
  },
  {
    path: '/remaja/:id',
    name: 'remaja-detail',
    redirect: { name: 'remaja' },
  },
]
