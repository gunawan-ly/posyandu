import { wajibSupabase } from '@/supabase/client'
import { lemparGalat } from '@/lib/galat'
import { hitungUmurBulan, parseTanggal } from '@/lib/umur'

// Lapisan akses data modul Apras (anak pra sekolah usia 61–72 bulan / 5–6 tahun).
//
// Beda dari Balita: TIDAK ada kolom status/z-score — referensi WHO LMS hanya
// sampai 60 bulan (wfa/lhfa/hcfa/acfa max kunci = 60), sehingga pengukuran
// disimpan apa adanya tanpa klasifikasi. Vitamin A, ASI eksklusif & MP-ASI
// juga tidak ada (tidak relevan untuk kelompok umur ini).

export interface Apras {
  id: number
  nama: string
  nik: string | null
  jenis_kelamin: string | null
  tanggal_lahir: string
  tempat_lahir: string | null
  anak_ke: string | null
  nama_orang_tua: string | null
  nik_orang_tua: string | null
  nomor_kk: string | null
  dusun: string | null
  alamat: string | null
  posyandu: string | null
  dibuat_oleh: string | null
  created_at: string
}

export interface KunjunganApras {
  id: number
  apras_id: number | null
  nama_anak: string | null
  umur_bulan: number | null
  tanggal_kunjungan: string | null
  berat_badan: number | null
  tinggi_badan: number | null
  lingkar_kepala: number | null
  lingkar_lengan: number | null
  gejala_tbc: string | null
  obat_cacing: string | null
  edukasi: string | null
  dirujuk: string | null
  catatan: string | null
  dibuat_oleh: string | null
  created_at: string
}

export interface InputApras {
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
  posyandu?: string | null
}

export interface InputKunjunganApras {
  tanggal_kunjungan: string
  berat_badan?: number | null
  tinggi_badan?: number | null
  lingkar_kepala?: number | null
  lingkar_lengan?: number | null
  gejala_tbc?: string | null
  obat_cacing?: string | null
  edukasi?: string | null
  dirujuk?: string | null
  catatan?: string | null
}

export async function listApras(cari = ''): Promise<Apras[]> {
  const kl = wajibSupabase()
  let q = kl.from('apras_identitas').select('*').order('nama')
  if (cari.trim()) {
    // Buang karakter khusus filter .or() PostgREST (koma, kurung) agar tidak memecah query.
    const kata = cari.trim().replace(/[,()]/g, '')
    if (kata) {
      q = q.or(`nama.ilike.%${kata}%,nama_orang_tua.ilike.%${kata}%,nik.ilike.%${kata}%`)
    }
  }
  const { data, error } = await q
  if (error) lemparGalat(error)
  return (data ?? []) as Apras[]
}

export async function ambilApras(id: number): Promise<Apras | null> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('apras_identitas')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) lemparGalat(error)
  return (data ?? null) as Apras | null
}

export async function buatApras(input: InputApras): Promise<Apras> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('apras_identitas')
    .insert(input)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as Apras
}

export async function ubahApras(id: number, patch: Partial<InputApras>): Promise<Apras> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('apras_identitas')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as Apras
}

export async function hapusApras(id: number): Promise<void> {
  const kl = wajibSupabase()
  const { error } = await kl.from('apras_identitas').delete().eq('id', id)
  if (error) lemparGalat(error)
}

export async function listKunjunganApras(aprasId: number): Promise<KunjunganApras[]> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('apras_kunjungan')
    .select('*')
    .eq('apras_id', aprasId)
    .order('tanggal_kunjungan', { ascending: true })
    .order('id', { ascending: true })
  if (error) lemparGalat(error)
  return (data ?? []) as KunjunganApras[]
}

// Susun isi baris kunjungan apras siap simpan — dipakai bersama tambah & ubah.
function susunIsiKunjungan(apras: Apras, input: InputKunjunganApras) {
  const lahir = parseTanggal(apras.tanggal_lahir)
  const kunjungan = parseTanggal(input.tanggal_kunjungan)
  if (!kunjungan) throw new Error('Tanggal kunjungan tidak valid.')
  if (lahir && kunjungan.getTime() < lahir.getTime()) {
    throw new Error('Tanggal kunjungan tidak boleh sebelum tanggal lahir.')
  }

  // Umur dihitung dari tanggal lahir; bila tanggal lahir kosong dikosongkan.
  const umurBulan = lahir ? hitungUmurBulan(lahir, kunjungan) : null

  return {
    apras_id: apras.id,
    nama_anak: apras.nama,
    tanggal_kunjungan: input.tanggal_kunjungan,
    umur_bulan: umurBulan,
    berat_badan: input.berat_badan ?? null,
    tinggi_badan: input.tinggi_badan ?? null,
    lingkar_kepala: input.lingkar_kepala ?? null,
    lingkar_lengan: input.lingkar_lengan ?? null,
    gejala_tbc: input.gejala_tbc ?? null,
    obat_cacing: input.obat_cacing ?? null,
    edukasi: input.edukasi ?? null,
    dirujuk: input.dirujuk ?? null,
    catatan: input.catatan ?? null,
  }
}

export async function tambahKunjunganApras(
  apras: Apras,
  input: InputKunjunganApras,
): Promise<KunjunganApras> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('apras_kunjungan')
    .insert(susunIsiKunjungan(apras, input))
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as KunjunganApras
}

// Ubah kunjungan apras yang sudah ada.
export async function ubahKunjunganApras(
  apras: Apras,
  id: number,
  input: InputKunjunganApras,
): Promise<KunjunganApras> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('apras_kunjungan')
    .update(susunIsiKunjungan(apras, input))
    .eq('id', id)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as KunjunganApras
}

export async function hapusKunjunganApras(id: number): Promise<void> {
  const kl = wajibSupabase()
  const { error } = await kl.from('apras_kunjungan').delete().eq('id', id)
  if (error) lemparGalat(error)
}
