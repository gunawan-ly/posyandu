import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/supabase/client'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
    },
    {
      path: '/kalkulator',
      name: 'kalkulator',
      component: () => import('@/views/KalkulatorView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/balita',
      name: 'balita',
      component: () => import('@/views/BalitaListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/balita/baru',
      name: 'balita-baru',
      component: () => import('@/views/BalitaFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/balita/:id/edit',
      name: 'balita-edit',
      component: () => import('@/views/BalitaFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/balita/:id',
      name: 'balita-detail',
      component: () => import('@/views/BalitaDetailView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    if (!supabase) return { name: 'landing' }
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }
  if (to.meta.requiresAdmin && supabase) {
    const { data: admin } = await supabase.rpc('is_admin')
    if (admin !== true) return { name: 'balita' }
  }
  return true
})

export default router
