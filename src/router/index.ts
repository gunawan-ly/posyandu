import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/supabase/client'
import { balitaRoutes } from '@/modules/balita/routes'

const reduksiGerak =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, _from, savedPosition) => {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, behavior: reduksiGerak ? 'auto' : 'smooth' }
    }
    return { top: 0 }
  },
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
    ...balitaRoutes,
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
