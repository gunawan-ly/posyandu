import { wajibSupabase } from '@/supabase/client'
import { lemparGalat } from '@/lib/galat'
import { hitungSemuaStatus, hitungZLik, hitungZLil, klasifikasiLika, klasifikasiLila } from '@/lib/kalkulator'
import { labelStatus } from '@/lib/status'
import { hitungUmurBulan, parseTanggal } from '@/lib/umur'

// Lapisan akses data modul Balita — satu sumber kebenaran status adalah
// kalkulator TypeScript; hasilnya disimpan sebagai label Indonesia agar
// konsisten dengan data eksisting di Supabase.

// Tampilkan nilai Ya/Tidak secara konsisten (data lama memakai Y/T).
export function labelYaTidak(nilai: string | null | undefined): string {
  if (nilai == null || nilai === '') return '—'
  if (nilai === 'Y') return 'Ya'
  if (nilai === 'T') return 'Tidak'
  return nilai
}

const KODE_BULAN = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGST', 'SEP', 'OKT', 'NOV', 'DES']

// Kode bulan (kolom legacy) diturunkan dari tanggal kunjungan agar konsisten.
function kodeBulan(tgl: string): string | null {
  const d = parseTanggal(tgl)
  if (!d) return null
  return KODE_BULAN[d.getMonth()]
}

export interface Balita {
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
  bb_lahir: number | null
  pb_lahir: number | null
  posyandu: string | null
  dibuat_oleh: string | null
  created_at: string
}

export interface Kunjungan {
  id: number
  balita_id: number | null
  nama_anak: string | null
  bulan: string | null
  tanggal_kunjungan: string | null
  ceklis_perkembangan: string | null
  berat_badan: number | null
  bb_naik_tidak: string | null
  bb_menurut_umur: string | null
  tinggi_badan: number | null
  pbtb_menurut_umur: string | null
  bb_menurut_pbtb: string | null
  lingkar_kepala: number | null
  status_lingkar_kepala: string | null
  lingkar_lengan: number | null
  status_lingkar_lengan: string | null
  vitamin_a: string | null
  gejala_tbc: string | null
  asi_eksklusif: string | null
  mp_asi: string | null
  imunisasi: string | null
  obat_cacing: string | null
  mt_pangan_lokal: string | null
  edukasi: string | null
  umur_bulan: number | null
  z_bb_u: number | null
  z_tb_u: number | null
  z_bb_tb: number | null
  dibuat_oleh: string | null
  created_at: string
}

export interface InputBalita {
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
  bb_lahir?: number | null
  pb_lahir?: number | null
  posyandu?: string | null
}

export interface InputKunjungan {
  tanggal_kunjungan: string
  berat_badan: number
  tinggi_badan: number
  lingkar_lengan?: number | null
  status_lingkar_lengan?: string | null
  lingkar_kepala?: number | null
  status_lingkar_kepala?: string | null
  imunisasi?: string | null
  vitamin_a?: string | null
  asi_eksklusif?: string | null
  mp_asi?: string | null
  obat_cacing?: string | null
  bb_naik_tidak?: string | null
  ceklis_perkembangan?: string | null
  gejala_tbc?: string | null
  edukasi?: string | null
}

export async function listBalita(cari = ''): Promise<Balita[]> {
  const kl = wajibSupabase()
  let q = kl.from('balita_identitas').select('*').order('nama')
  if (cari.trim()) {
    // Buang karakter khusus filter .or() PostgREST (koma, kurung) agar tidak memecah query.
    const kata = cari.trim().replace(/[,()]/g, '')
    if (kata) {
      q = q.or(`nama.ilike.%${kata}%,nama_orang_tua.ilike.%${kata}%,nik.ilike.%${kata}%`)
    }
  }
  const { data, error } = await q
  if (error) lemparGalat(error)
  return (data ?? []) as Balita[]
}

export async function ambilBalita(id: number): Promise<Balita | null> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('balita_identitas')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) lemparGalat(error)
  return (data ?? null) as Balita | null
}

export async function buatBalita(input: InputBalita): Promise<Balita> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('balita_identitas')
    .insert(input)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as Balita
}

export async function ubahBalita(id: number, patch: Partial<InputBalita>): Promise<Balita> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('balita_identitas')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as Balita
}

export async function hapusBalita(id: number): Promise<void> {
  const kl = wajibSupabase()
  const { error } = await kl.from('balita_identitas').delete().eq('id', id)
  if (error) lemparGalat(error)
}

export async function listKunjungan(balitaId: number): Promise<Kunjungan[]> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('balita_kunjungan')
    .select('*')
    .eq('balita_id', balitaId)
    .order('tanggal_kunjungan', { ascending: true })
    .order('id', { ascending: true })
  if (error) lemparGalat(error)
  return (data ?? []) as Kunjungan[]
}

// Rekap: kunjungan dalam rentang tanggal (inklusi batas awal & akhir, format YYYY-MM-DD).
export async function listKunjunganPeriode(awal: string, akhir: string): Promise<Kunjungan[]> {
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('balita_kunjungan')
    .select('*')
    .gte('tanggal_kunjungan', awal)
    .lte('tanggal_kunjungan', akhir)
    .order('tanggal_kunjungan', { ascending: true })
    .order('id', { ascending: true })
  if (error) lemparGalat(error)
  return (data ?? []) as Kunjungan[]
}

// Rekap: ambil balita berdasarkan daftar id (urut nama); kosong bila ids kosong.
export async function listBalitaById(ids: number[]): Promise<Balita[]> {
  if (ids.length === 0) return []
  const kl = wajibSupabase()
  const { data, error } = await kl
    .from('balita_identitas')
    .select('*')
    .in('id', ids)
    .order('nama')
  if (error) lemparGalat(error)
  return (data ?? []) as Balita[]
}

export async function tambahKunjungan(balita: Balita, input: InputKunjungan): Promise<Kunjungan> {
  const kl = wajibSupabase()

  const lahir = parseTanggal(balita.tanggal_lahir)
  const kunjungan = parseTanggal(input.tanggal_kunjungan)
  if (!kunjungan) throw new Error('Tanggal kunjungan tidak valid.')
  if (lahir && kunjungan.getTime() < lahir.getTime()) {
    throw new Error('Tanggal kunjungan tidak boleh sebelum tanggal lahir.')
  }

  // Tanpa tanggal lahir: umur belum diketahui — status & z-score dikosongkan
  // sampai tanggal lahir diperbarui.
  const jenis = balita.jenis_kelamin === 'Perempuan' ? 'P' : 'L'
  const umurBulan = lahir ? hitungUmurBulan(lahir, kunjungan) : null
  const hasil = umurBulan != null ? hitungSemuaStatus(jenis, umurBulan, input.berat_badan, input.tinggi_badan) : null

  if (hasil?.error && (hasil.status_bb_u === '_' || hasil.status_tb_u === '_' || hasil.status_bb_tb === '_')) {
    throw new Error(hasil.error)
  }

  // Status lingkar kepala & lengan dihitung otomatis dari pengukuran (jika ada).
  const zLika = umurBulan != null && input.lingkar_kepala != null ? hitungZLik(jenis, umurBulan, input.lingkar_kepala) : null
  const zLila = umurBulan != null && input.lingkar_lengan != null ? hitungZLil(jenis, umurBulan, input.lingkar_lengan) : null
  const statusLika = zLika != null ? labelStatus(klasifikasiLika(zLika)) : (input.status_lingkar_kepala ?? null)
  const statusLila = zLila != null ? labelStatus(klasifikasiLila(zLila)) : (input.status_lingkar_lengan ?? null)

  const { data, error } = await kl
    .from('balita_kunjungan')
    .insert({
      balita_id: balita.id,
      nama_anak: balita.nama,
      tanggal_kunjungan: input.tanggal_kunjungan,
      bulan: kodeBulan(input.tanggal_kunjungan),
      berat_badan: input.berat_badan,
      tinggi_badan: input.tinggi_badan,
      lingkar_lengan: input.lingkar_lengan ?? null,
      status_lingkar_lengan: statusLila,
      lingkar_kepala: input.lingkar_kepala ?? null,
      status_lingkar_kepala: statusLika,
      imunisasi: input.imunisasi ?? null,
      vitamin_a: input.vitamin_a ?? null,
      asi_eksklusif: input.asi_eksklusif ?? null,
      mp_asi: input.mp_asi ?? null,
      obat_cacing: input.obat_cacing ?? null,
      bb_naik_tidak: input.bb_naik_tidak ?? null,
      ceklis_perkembangan: input.ceklis_perkembangan ?? null,
      gejala_tbc: input.gejala_tbc ?? null,
      edukasi: input.edukasi ?? null,
      umur_bulan: umurBulan,
      bb_menurut_umur: hasil ? labelStatus(hasil.status_bb_u) : null,
      pbtb_menurut_umur: hasil ? labelStatus(hasil.status_tb_u) : null,
      bb_menurut_pbtb: hasil ? labelStatus(hasil.status_bb_tb) : null,
      z_bb_u: hasil?.z_bb_u ?? null,
      z_tb_u: hasil?.z_tb_u ?? null,
      z_bb_tb: hasil?.z_bb_tb ?? null,
    })
    .select()
    .single()
  if (error) lemparGalat(error)
  return data as Kunjungan
}

export async function hapusKunjungan(id: number): Promise<void> {
  const kl = wajibSupabase()
  const { error } = await kl.from('balita_kunjungan').delete().eq('id', id)
  if (error) lemparGalat(error)
}

// ---- Dashboard kader: kunjungan terakhir per balita (via RPC security invoker) ----

export interface KunjunganTerakhir {
  balita_id: number
  nama: string
  tanggal_lahir: string | null
  tanggal_kunjungan: string | null
  bb_menurut_umur: string | null
  pbtb_menurut_umur: string | null
  bb_menurut_pbtb: string | null
}

export async function kunjunganTerakhir(): Promise<KunjunganTerakhir[]> {
  const kl = wajibSupabase()
  const { data, error } = await kl.rpc('kunjungan_terakhir')
  if (error) lemparGalat(error)
  return (data ?? []) as KunjunganTerakhir[]
}

// Kriteria "Perlu Perhatian": status kunjungan terakhir tidak normal (kurus/pendek/gizi buruk/kurang).
const STATUS_PERLU_PERHATIAN = new Set([
  'Sangat Kurang',
  'Kurang',
  'Sangat Pendek',
  'Pendek',
  'Gizi Buruk',
  'Gizi Kurang',
])

function peringkatStatus(label: string | null): boolean {
  return label != null && STATUS_PERLU_PERHATIAN.has(label)
}

export async function balitaPerluPerhatian(): Promise<KunjunganTerakhir[]> {
  const daftar = await kunjunganTerakhir()
  return daftar.filter(
    (k) =>
      peringkatStatus(k.bb_menurut_umur) ||
      peringkatStatus(k.pbtb_menurut_umur) ||
      peringkatStatus(k.bb_menurut_pbtb),
  )
}