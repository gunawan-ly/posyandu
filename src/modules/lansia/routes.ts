import type { RouteRecordRaw } from 'vue-router'

// Rute modul Dewasa & Lansia — didaftarkan di src/router/index.ts via spread.
// Fase placeholder: detail & edit masih diarahkan ke daftar; struktur tabel menyusul batch berikutnya.
export const lansiaRoutes: RouteRecordRaw[] = [
  {
    path: '/lansia',
    name: 'lansia',
    component: () => import('@/modules/lansia/views/LansiaListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/lansia/baru',
    name: 'lansia-baru',
    component: () => import('@/modules/lansia/views/LansiaListView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/lansia/:id/edit',
    name: 'lansia-edit',
    redirect: { name: 'lansia' },
  },
  {
    path: '/lansia/:id',
    name: 'lansia-detail',
    redirect: { name: 'lansia' },
  },
]
