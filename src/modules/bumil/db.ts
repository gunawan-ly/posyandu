import { escapeIlike } from '@/lib/cari'
import { wajibSupabase } from '@/supabase/client'
import { lemparGalat } from '@/lib/galat'
import { parseTanggal } from '@/lib/umur'

// Lapisan akses data modul Bumil. Tidak ada kalkulator z-score WHO untuk
// kehamilan, jadi status (BB sesuai kurva KIA, LILA hijau/merah, TD sesuai
// kurva KIA) disimpan sebagai pilihan manual dari daftar label standar.

// Opsi label standar untuk field kunjungan.
export const KATEGORI_BUMIL = ['Hamil', 'Menyusui', 'Nifas'] as const

export const OPSI_BB_KURVA = ['Sesuai', 'Tidak Sesuai'] as const
export const OPSI_LILA = ['Hijau', 'Merah'] as const
export const OPSI_TD_KURVA = ['Normal', 'Tinggi'] as const
export const OPSI_YA_TIDAK = ['Ya', 'Tidak'] as const

// Re-export dari sumber tunggal di lib/label.
export { labelYaTidak } from '@/lib/label'

export interface Bumil {
  id: number
  nama: string | null
  nik: string | null
  tanggal_lahir: string | null
  umur: string | null
  nama_suami: string | null
  nomor_kk: string | null
  alamat: string | null
  dusun: string | null
  hamil_anak_ke: string | null
  jarak_dengan_anak_sebelumnya: string | null
  tanggal_bersalin: string | null
  tempat_bersalin: string | null
  cara_persalin: string | null
  anak_ke: string | null
  kategori: string | null
  created_at: string
}

export interface KunjunganBumil {
  id: number
  bumil_id: number | null
  nama: string | null
  kategori: string | null
  tanggal_kunjungan: string | null
  usia_kehamilan_minggu: number | null
  berat_badan: number | null
  bb_sesuai_kurva_kia: string | null
  lingkaran_lengan_atas: number | null
  lila_hijau_merah: string | null
  tekanan_darah: string | null
  td_sesuai_kurva_kia: string | null
  batuk_terus_menerus: string | null
  demam_lebih_dua_minggu: string | null
  bb_tidak_naik_dua_bulan: string | null
  kontak_tbc: string | null
  dapat_tablet_ttd: string | null
  konsumsi_ttd: string | null
  mt_kek_diberikan: string | null
  konsumsi_mt_kek: string | null
  kelas_bumil: string | null
  vitamin_a: string | null
  kb_pasca_persalinan: string | null
  dapat_edukasi: string | null
  dirujuk: string | null
  created_at: string
}

export interface InputBumil {
  nama: string
  nik?: string | null
  tanggal_lahir?: string | null
  umur?: string | null
  nama_suami?: string | null
  nomor_kk?: string | null
  alamat?: string | null
  dusun?: string | null
  hamil_anak_ke?: string | null
  jarak_dengan_anak_sebelumnya?: string | null
  tanggal_bersalin?: string | null
  tempat_bersalin?: string | null
  cara_persalin?: string | null
  anak_ke?: string | null
  kategori?: string | null
}

export interface InputKunjunganBumil {
  tanggal_kunjungan: string
  kategori: string
  usia_kehamilan_minggu?: number | null
  berat_badan?: number | null
  bb_sesuai_kurva_kia?: string | null
  lingkaran_lengan_atas?: number | null
  lila_hijau_merah?: string | null
  tekanan_darah?: string | null
  td_sesuai_kurva_kia?: string | null
  batuk_terus_menerus?: string | null
  demam_lebih_dua_minggu?: string | null
  bb_tidak_naik_dua_bulan?: string | null
  kontak_tbc?: string | null
  dapat_tablet_ttd?: string | null
  konsumsi_ttd?: string | null
  mt_kek_diberikan?: string | null
  konsumsi_mt_kek?: string | null
  kelas_bumil?: string | null
  vitamin_a?: string | null
  kb_pasca_persalinan?: string | null
  dapat_edukasi?: string | null
  dirujuk?: string | null
}

export async function listBumil(cari = ''): Promise<Bumil[]> {
  const kl = wajibSupabase()
  let q = kl.from('bumil_identitas').select('*').order('nama')
  if (cari.trim()) {
    // Buang karakter khusus filter .or() PostgREST (koma, kurung) agar tidak memecah query.
    const kata = escapeIlike(cari.trim().replace(/[,()]/g, ''))
    if (kata) {
      q = q.or(`nama.ilike.%${kata}%,nama_suami.ilike.%${kata}%,nik.ilike.%${kata}%,dusun.ilike.%${kata}%`)
    }
  }
  const { data, error } = await q
  if (error) lemparGalat(error)
  return (data ?? []) as Bumil[]
}

export async function ambilBumil(id: number): Promise<Bumil | null> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('bumil_identitas')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) lemparGalat(error)
  return (data ?? null) as Bumil | null
}

export async function buatBumil(input: InputBumil): Promise<Bumil> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('bumil_identitas')
    .insert(input)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as Bumil
}

export async function ubahBumil(id: number, patch: Partial<InputBumil>): Promise<Bumil> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('bumil_identitas')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as Bumil
}

export async function hapusBumil(id: number): Promise<void> {
  const kl = wajibSupabase()
  const { error } = await kl.from('bumil_identitas').delete().eq('id', id)
  if (error) lemparGalat(error)
}

export async function listKunjunganBumil(bumilId: number): Promise<KunjunganBumil[]> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('bumil_kunjungan')
    .select('*')
    .eq('bumil_id', bumilId)
    .order('tanggal_kunjungan', { ascending: true })
    .order('id', { ascending: true })
  if (error) lemparGalat(error)
  return (data ?? []) as KunjunganBumil[]
}

// Rekap: kunjungan semua bumil dalam rentang tanggal (inklusi batas, YYYY-MM-DD).
export async function listKunjunganPeriode(awal: string, akhir: string): Promise<KunjunganBumil[]> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('bumil_kunjungan')
    .select('*')
    .gte('tanggal_kunjungan', awal)
    .lte('tanggal_kunjungan', akhir)
    .order('tanggal_kunjungan', { ascending: true })
    .order('id', { ascending: true })
  if (error) lemparGalat(error)
  return (data ?? []) as KunjunganBumil[]
}

// Susun isi baris kunjungan bumil siap simpan — dipakai bersama tambah & ubah.
export function susunIsiKunjungan(bumil: Bumil, input: InputKunjunganBumil) {
  const kunjungan = parseTanggal(input.tanggal_kunjungan)
  if (!kunjungan) throw new Error('Tanggal kunjungan tidak valid.')

  return {
    bumil_id: bumil.id,
    nama: bumil.nama,
    tanggal_kunjungan: input.tanggal_kunjungan,
    kategori: input.kategori ?? null,
    usia_kehamilan_minggu: input.usia_kehamilan_minggu ?? null,
    berat_badan: input.berat_badan ?? null,
    bb_sesuai_kurva_kia: input.bb_sesuai_kurva_kia ?? null,
    lingkaran_lengan_atas: input.lingkaran_lengan_atas ?? null,
    lila_hijau_merah: input.lila_hijau_merah ?? null,
    tekanan_darah: input.tekanan_darah ?? null,
    td_sesuai_kurva_kia: input.td_sesuai_kurva_kia ?? null,
    batuk_terus_menerus: input.batuk_terus_menerus ?? null,
    demam_lebih_dua_minggu: input.demam_lebih_dua_minggu ?? null,
    bb_tidak_naik_dua_bulan: input.bb_tidak_naik_dua_bulan ?? null,
    kontak_tbc: input.kontak_tbc ?? null,
    dapat_tablet_ttd: input.dapat_tablet_ttd ?? null,
    konsumsi_ttd: input.konsumsi_ttd ?? null,
    mt_kek_diberikan: input.mt_kek_diberikan ?? null,
    konsumsi_mt_kek: input.konsumsi_mt_kek ?? null,
    kelas_bumil: input.kelas_bumil ?? null,
    vitamin_a: input.vitamin_a ?? null,
    kb_pasca_persalinan: input.kb_pasca_persalinan ?? null,
    dapat_edukasi: input.dapat_edukasi ?? null,
    dirujuk: input.dirujuk ?? null,
  }
}

export async function tambahKunjunganBumil(bumil: Bumil, input: InputKunjunganBumil): Promise<KunjunganBumil> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('bumil_kunjungan')
    .insert(susunIsiKunjungan(bumil, input))
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as KunjunganBumil
}

// Ubah kunjungan bumil yang sudah ada.
export async function ubahKunjunganBumil(
  bumil: Bumil,
  id: number,
  input: InputKunjunganBumil,
): Promise<KunjunganBumil> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('bumil_kunjungan')
    .update(susunIsiKunjungan(bumil, input))
    .eq('id', id)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as KunjunganBumil
}

export async function hapusKunjunganBumil(id: number): Promise<void> {
  const kl = wajibSupabase()
  const { error } = await kl.from('bumil_kunjungan').delete().eq('id', id)
  if (error) lemparGalat(error)
}
