import type { RouteRecordRaw } from 'vue-router'

// Rute modul Apras (anak pra sekolah 5–6 tahun) — didaftarkan di src/router/index.ts via spread.
// Fase kerangka: detail & edit masih diarahkan ke daftar; struktur tabel menyusul batch berikutnya.
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
    component: () => import('@/modules/apras/views/AprasListView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/apras/:id/edit',
    name: 'apras-edit',
    redirect: { name: 'apras' },
  },
  {
    path: '/apras/:id',
    name: 'apras-detail',
    redirect: { name: 'apras' },
  },
]
