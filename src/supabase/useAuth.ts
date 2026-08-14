import { computed, readonly, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/supabase/client'

const user = ref<User | null>(null)
const memuat = ref(false)
let terinisialisasi = false

async function inisialisasi() {
  if (terinisialisasi) return
  terinisialisasi = true
  memuat.value = true
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    supabase.auth.onAuthStateChange((_event, sesi) => {
      user.value = sesi?.user ?? null
    })
  }
  memuat.value = false
}

async function masuk(email: string, kataSandi: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { error } = await supabase.auth.signInWithPassword({ email, password: kataSandi })
  if (error) throw error
}

async function daftar(email: string, kataSandi: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const { data, error } = await supabase.auth.signUp({ email, password: kataSandi })
  if (error) throw error
  return data
}

async function keluar() {
  await supabase?.auth.signOut()
}

export function useAuth() {
  return {
    user: readonly(user),
    memuat: readonly(memuat),
    isAutentikasi: computed(() => user.value !== null),
    inisialisasi,
    masuk,
    daftar,
    keluar,
  }
}
