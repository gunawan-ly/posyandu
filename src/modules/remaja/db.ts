// Lapisan akses data modul Remaja (anak usia sekolah & remaja 7–18 tahun).
//
// Fase 1: identitas + CRUD. Kunjungan, standar antropometri remaja (indeks
// massa tubuh per umur, dll.) & rekap menyusul batch berikutnya — struktur
// tabel kunjungan disusun belakangan setelah diskusi plan.
//
// Status/z-score TIDAK dihitung di fase ini (referensi WHO LMS hanya sampai
// 60 bulan / balita). Identitas ekstra yang disimpan hanya `nama_sekolah`.

import { escapeIlike } from '@/lib/cari'
import { wajibSupabase } from '@/supabase/client'
import { lemparGalat } from '@/lib/galat'

export interface Remaja {
  id: number
  nama: string
  nik: string | null
  jenis_kelamin: string | null
  tanggal_lahir: string | null
  tempat_lahir: string | null
  anak_ke: string | null
  nama_orang_tua: string | null
  nik_orang_tua: string | null
  nomor_kk: string | null
  dusun: string | null
  alamat: string | null
  nama_sekolah: string | null
  dibuat_oleh: string | null
  created_at: string
}

export interface InputRemaja {
  nama: string
  jenis_kelamin: string
  tanggal_lahir: string
  nik?: string | null
  tempat_lahir?: string | null
  anak_ke?: string | null
  nama_orang_tua?: string | null
  nik_orang_tua?: string | null
  nomor_kk?: string | null
  dusun?: string | null
  alamat?: string | null
  nama_sekolah?: string | null
}

export async function listRemaja(cari = ''): Promise<Remaja[]> {
  const kl = wajibSupabase()
  let q = kl.from('remaja_identitas').select('*').order('nama')
  if (cari.trim()) {
    // Buang karakter khusus filter .or() PostgREST (koma, kurung) agar tidak memecah query.
    const kata = escapeIlike(cari.trim().replace(/[,()]/g, ''))
    if (kata) {
      q = q.or(`nama.ilike.%${kata}%,nama_orang_tua.ilike.%${kata}%,nik.ilike.%${kata}%`)
    }
  }
  const { data, error } = await q
  if (error) lemparGalat(error)
  return (data ?? []) as Remaja[]
}

export async function ambilRemaja(id: number): Promise<Remaja | null> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('remaja_identitas')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) lemparGalat(error)
  return (data ?? null) as Remaja | null
}

export async function buatRemaja(input: InputRemaja): Promise<Remaja> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('remaja_identitas')
    .insert(input)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as Remaja
}

export async function ubahRemaja(id: number, patch: Partial<InputRemaja>): Promise<Remaja> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('remaja_identitas')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as Remaja
}

export async function hapusRemaja(id: number): Promise<void> {
  const kl = wajibSupabase()
  const { error } = await kl.from('remaja_identitas').delete().eq('id', id)
  if (error) lemparGalat(error)
}
