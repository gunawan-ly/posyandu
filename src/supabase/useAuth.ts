import { computed, readonly, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { lemparGalat } from '@/lib/galat'
import { supabase } from '@/supabase/client'

// Tujuan redirect setelah konfirmasi email. Bisa di-set lewat VITE_APP_URL,
// fallback ke asal halaman + base path (otomatis benar di GitHub Pages & dev).
const urlAplikasi =
  import.meta.env.VITE_APP_URL || window.location.origin + import.meta.env.BASE_URL

const user = ref<User | null>(null)
const memuat = ref(false)
const isAdmin = ref(false)
let terinisialisasi = false

async function muatPeran() {
  isAdmin.value = false
  if (!supabase || !user.value) return
  try {
    const { data } = await supabase.rpc('is_admin')
    isAdmin.value = data === true
  } catch {
    isAdmin.value = false
  }
}

async function inisialisasi() {
  if (terinisialisasi) return
  terinisialisasi = true
  memuat.value = true
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    await muatPeran()
    supabase.auth.onAuthStateChange((_event, sesi) => {
      user.value = sesi?.user ?? null
      void muatPeran()
    })
  }
  memuat.value = false
}

async function masuk(email: string, kataSandi: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.auth.signInWithPassword({ email, password: kataSandi })
  if (error) lemparGalat(error)
}

async function daftar(email: string, kataSandi: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.auth.signUp({
    email,
    password: kataSandi,
    options: { emailRedirectTo: urlAplikasi },
  })
  if (error) lemparGalat(error)
  return data
}

async function keluar() {
  await supabase?.auth.signOut()
  isAdmin.value = false
}

export function useAuth() {
  return {
    user: readonly(user),
    memuat: readonly(memuat),
    isAutentikasi: computed(() => user.value !== null),
    isAdmin: readonly(isAdmin),
    inisialisasi,
    masuk,
    daftar,
    keluar,
  }
}
