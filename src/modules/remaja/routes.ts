import type { RouteRecordRaw } from 'vue-router'

// Rute modul Remaja (anak usia sekolah & remaja 7–18 tahun) — didaftarkan di src/router/index.ts via spread.
// Fase 1: CRUD identitas lewat modal di daftar. Kunjungan menyusul batch berikutnya.
export const remajaRoutes: RouteRecordRaw[] = [
  {
    path: '/remaja',
    name: 'remaja',
    component: () => import('@/modules/remaja/views/RemajaListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    // Konsolidasi form: tambah lewat modal di daftar (tautan /remaja?tambah=1 dari Dashboard).
    path: '/remaja/baru',
    redirect: '/remaja',
  },
  {
    // Konsolidasi form: ubah lewat modal di daftar / detail.
    path: '/remaja/:id/edit',
    redirect: '/remaja',
  },
  {
    path: '/remaja/:id',
    name: 'remaja-detail',
    component: () => import('@/modules/remaja/views/RemajaDetailView.vue'),
    meta: { requiresAuth: true },
  },
]
