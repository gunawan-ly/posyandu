import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Dibuat hanya jika variabel lingkungan tersedia (mode anonim tanpa DB bila kosong).
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseSiap = (): boolean => supabase !== null

// Melempar error bila Supabase belum dikonfigurasi — dipakai lapisan data per modul.
export function wajibSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  return supabase
}
