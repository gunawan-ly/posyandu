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
import { hitungUmurBulan, parseTanggal } from '@/lib/umur'

export interface Remaja {
  id: number
  nama: string
  nik: string | null
  jenis_kelamin: string | null
  tanggal_lahir: string | null
  tempat_lahir: string | null
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

// ===== Kunjungan =====

// Kunjungan remaja (fase 2). Status gizi (imt & status_gizi) diisi MANUAL oleh
// kader untuk saat ini; hitung & klasifikasi otomatis (IMT-for-age WHO 2007)
// menyusul batch berikutnya.
export interface KunjunganRemaja {
  id: number
  remaja_id: number | null
  nama_remaja: string | null
  umur_tahun: number | null
  tanggal_kunjungan: string | null
  berat_badan: number | null
  tinggi_badan: number | null
  imt: number | null
  status_gizi: string | null
  lingkar_perut: number | null
  td_sistole: number | null
  td_diastole: number | null
  td_kategori: string | null
  gula_darah: number | null
  gula_kategori: string | null
  hb: number | null
  anemia: string | null
  batuk_terus_menerus: string | null
  demam_lebih_dua_minggu: string | null
  bb_tidak_naik_dua_bulan: string | null
  kontak_erat_tbc: string | null
  edukasi: string | null
  rujuk: string | null
  catatan: string | null
  dibuat_oleh: string | null
  created_at: string
}

export interface InputKunjunganRemaja {
  tanggal_kunjungan: string
  berat_badan?: number | null
  tinggi_badan?: number | null
  imt?: number | null
  status_gizi?: string | null
  lingkar_perut?: number | null
  td_sistole?: number | null
  td_diastole?: number | null
  td_kategori?: string | null
  gula_darah?: number | null
  gula_kategori?: string | null
  hb?: number | null
  anemia?: string | null
  batuk_terus_menerus?: string | null
  demam_lebih_dua_minggu?: string | null
  bb_tidak_naik_dua_bulan?: string | null
  kontak_erat_tbc?: string | null
  edukasi?: string | null
  rujuk?: string | null
  catatan?: string | null
}

export async function listKunjunganRemaja(remajaId: number): Promise<KunjunganRemaja[]> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('remaja_kunjungan')
    .select('*')
    .eq('remaja_id', remajaId)
    .order('tanggal_kunjungan', { ascending: true })
    .order('id', { ascending: true })
  if (error) lemparGalat(error)
  return (data ?? []) as KunjunganRemaja[]
}

// Rekap: kunjungan semua remaja dalam rentang tanggal (inklusi batas, YYYY-MM-DD).
export async function listKunjunganRemajaPeriode(awal: string, akhir: string): Promise<KunjunganRemaja[]> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('remaja_kunjungan')
    .select('*')
    .gte('tanggal_kunjungan', awal)
    .lte('tanggal_kunjungan', akhir)
    .order('tanggal_kunjungan', { ascending: true })
    .order('id', { ascending: true })
  if (error) lemparGalat(error)
  return (data ?? []) as KunjunganRemaja[]
}

// Susun isi baris kunjungan remaja siap simpan — dipakai bersama tambah & ubah.
export function susunIsiKunjungan(remaja: Remaja, input: InputKunjunganRemaja) {
  const lahir = parseTanggal(remaja.tanggal_lahir ?? '')
  const kunjungan = parseTanggal(input.tanggal_kunjungan)
  if (!kunjungan) throw new Error('Tanggal kunjungan tidak valid.')
  if (lahir && kunjungan.getTime() < lahir.getTime()) {
    throw new Error('Tanggal kunjungan tidak boleh sebelum tanggal lahir.')
  }

  // Umur dihitung dari tanggal lahir; bila tanggal lahir kosong dikosongkan.
  const umurBulan = lahir ? hitungUmurBulan(lahir, kunjungan) : null

  return {
    remaja_id: remaja.id,
    nama_remaja: remaja.nama,
    tanggal_kunjungan: input.tanggal_kunjungan,
    umur_tahun: umurBulan != null ? umurBulan / 12 : null,
    berat_badan: input.berat_badan ?? null,
    tinggi_badan: input.tinggi_badan ?? null,
    imt: input.imt ?? null,
    status_gizi: input.status_gizi ?? null,
    lingkar_perut: input.lingkar_perut ?? null,
    td_sistole: input.td_sistole ?? null,
    td_diastole: input.td_diastole ?? null,
    td_kategori: input.td_kategori ?? null,
    gula_darah: input.gula_darah ?? null,
    gula_kategori: input.gula_kategori ?? null,
    hb: input.hb ?? null,
    anemia: input.anemia ?? null,
    batuk_terus_menerus: input.batuk_terus_menerus ?? null,
    demam_lebih_dua_minggu: input.demam_lebih_dua_minggu ?? null,
    bb_tidak_naik_dua_bulan: input.bb_tidak_naik_dua_bulan ?? null,
    kontak_erat_tbc: input.kontak_erat_tbc ?? null,
    edukasi: input.edukasi ?? null,
    rujuk: input.rujuk ?? null,
    catatan: input.catatan ?? null,
  }
}

export async function tambahKunjunganRemaja(
  remaja: Remaja,
  input: InputKunjunganRemaja,
): Promise<KunjunganRemaja> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('remaja_kunjungan')
    .insert(susunIsiKunjungan(remaja, input))
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as KunjunganRemaja
}

export async function ubahKunjunganRemaja(
  remaja: Remaja,
  id: number,
  patch: InputKunjunganRemaja,
): Promise<KunjunganRemaja> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('remaja_kunjungan')
    .update(susunIsiKunjungan(remaja, patch))
    .eq('id', id)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as KunjunganRemaja
}

export async function hapusKunjunganRemaja(id: number): Promise<void> {
  const kl = wajibSupabase()
  const { error } = await kl.from('remaja_kunjungan').delete().eq('id', id)
  if (error) lemparGalat(error)
}
