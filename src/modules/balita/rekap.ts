// Logika murni agregasi Rekap Bulanan Posyandu (format resmi: hitungan/jumlah).
// Tanpa akses Supabase — murni fungsi terhadap data yang diberikan.
import type { Balita, Kunjungan } from './db'
import { hitungUmurBulan, parseTanggal } from '@/lib/umur'

export interface RekapBulanan {
  sasaran_bayi: number
  sasaran_balita: number
  bayi_hadir: number
  bayi_tidak_hadir: number
  balita_hadir: number
  balita_tidak_hadir: number
  ceklis_lengkap: number
  ceklis_tidak_lengkap: number
  bb_naik: number
  bb_tidak_naik: number
  bbu_normal: number
  bbu_tidak_normal: number
  tbu_normal: number
  tbu_tidak_normal: number
  bbtb_normal: number
  bbtb_tidak_normal: number
  lika_normal: number
  lika_tidak_normal: number
  lila_normal: number
  lila_tidak_normal: number
  imunisasi_ya: number
  imunisasi_tidak: number
  vitamin_ya: number
  vitamin_tidak: number
  asi_ya: number
  asi_tidak: number
  mpasi_ya: number
  mpasi_tidak: number
  cacing_ya: number
  cacing_tidak: number
  edukasi_ya: number
  edukasi_tidak: number
}

export interface BarisRekap {
  nama: string
  jenis_kelamin: string | null
  tanggal_lahir: string
  umur_bulan: number | null
  dusun: string | null
  posyandu: string | null
  tanggal_kunjungan: string | null
  berat_badan: number | null
  tinggi_badan: number | null
  bb_menurut_umur: string | null
  pbtb_menurut_umur: string | null
  bb_menurut_pbtb: string | null
  status_lingkar_kepala: string | null
  status_lingkar_lengan: string | null
  z_bb_u: number | null
  z_tb_u: number | null
  z_bb_tb: number | null
}

// Periode rekap: satu bulan (bulan 0-indexed seperti JS) atau rentang tanggal YYYY-MM-DD.
export type PeriodeRekap = { bulan: number; tahun: number } | { awal: string; akhir: string }

// Filter kunjungan pada bulan-tahun tertentu (bulan 0-indexed, seperti JS).
export function filterKunjunganPeriode(kunjungan: Kunjungan[], bulan: number, tahun: number): Kunjungan[] {
  return kunjungan.filter((k) => {
    const tgl = parseTanggal(k.tanggal_kunjungan ?? '')
    return tgl !== null && tgl.getFullYear() === tahun && tgl.getMonth() === bulan
  })
}

// Filter kunjungan dalam rentang tanggal YYYY-MM-DD (inklusif kedua tepi).
export function filterKunjunganRentang(kunjungan: Kunjungan[], awal: string, akhir: string): Kunjungan[] {
  const batasAwal = parseTanggal(awal)
  const batasAkhir = parseTanggal(akhir)
  if (!batasAwal || !batasAkhir) return []
  return kunjungan.filter((k) => {
    const tgl = parseTanggal(k.tanggal_kunjungan ?? '')
    return tgl !== null && tgl.getTime() >= batasAwal.getTime() && tgl.getTime() <= batasAkhir.getTime()
  })
}

// Satu kunjungan terakhir per balita (urut tanggal naik, tiebreak id naik).
// Hasilnya dipakai agar tiap balita hanya "bersuara" sekali dalam rekap.
export function rekapPerBalita(kunjungan: Kunjungan[]): Map<number, Kunjungan> {
  const urut = [...kunjungan].sort((a, b) => {
    const ta = a.tanggal_kunjungan ?? ''
    const tb = b.tanggal_kunjungan ?? ''
    if (ta !== tb) return ta < tb ? -1 : 1
    return a.id - b.id
  })
  const hasil = new Map<number, Kunjungan>()
  for (const k of urut) {
    if (k.balita_id != null) hasil.set(k.balita_id, k)
  }
  return hasil
}

// Sasaran: umur < 12 bulan = bayi; 12–60 bulan = balita; tanggal lahir tidak valid → balita (aman).
export function klasifikasiSasaran(tanggalLahir: string, refTanggal: Date): 'bayi' | 'balita' {
  const lahir = parseTanggal(tanggalLahir)
  if (!lahir) return 'balita'
  return hitungUmurBulan(lahir, refTanggal) < 12 ? 'bayi' : 'balita'
}

// Nilai "Ya": cocok dengan pola Y/Ya/lengkap/1 (trim, case-insensitive).
// null / string kosong / nilai lain dianggap "Tidak".
function fungsiAktif(nilai: string | null | undefined): boolean {
  if (nilai == null) return false
  return /^(y|ya|lengkap|1| benar)$/i.test(nilai.trim())
}

// Label status "Normal": untuk BB/TB label normalnya "Gizi Baik".
function normalTidakNormal(label: string | null | undefined, labelNormal = 'Normal'): boolean {
  return label === labelNormal
}

// Tanggal akhir periode sebagai acuan umur sasaran (akhir bulan / tanggal akhir rentang).
function tanggalAkhirPeriode(periode: PeriodeRekap): Date {
  if ('bulan' in periode) return new Date(periode.tahun, periode.bulan + 1, 0)
  return parseTanggal(periode.akhir) ?? new Date()
}

export function hitungRekapBulanan(
  kunjunganPeriode: Kunjungan[],
  balita: Balita[],
  periode: PeriodeRekap,
): RekapBulanan {
  const refTanggal = tanggalAkhirPeriode(periode)
  const perBalita = rekapPerBalita(kunjunganPeriode)
  const daftarKunjungan = [...perBalita.values()]

  // Sasaran dihitung dari SEMUA balita terdata; kehadiran memakai satu suara per balita.
  const sasaranBayi = balita.filter((b) => klasifikasiSasaran(b.tanggal_lahir, refTanggal) === 'bayi').length
  const sasaranBalita = balita.length - sasaranBayi
  const hadir = new Set(perBalita.keys())
  let bayiHadir = 0
  let balitaHadir = 0
  for (const b of balita) {
    if (!hadir.has(b.id)) continue
    if (klasifikasiSasaran(b.tanggal_lahir, refTanggal) === 'bayi') bayiHadir += 1
    else balitaHadir += 1
  }

  // Dua kolom Ya/Tidak sekaligus atas kunjungan terakhir per balita (null dihitung "Tidak").
  const hitungDua = (ambil: (k: Kunjungan) => string | null | undefined): [number, number] => {
    let ya = 0
    let tidak = 0
    for (const k of daftarKunjungan) {
      if (fungsiAktif(ambil(k))) ya += 1
      else tidak += 1
    }
    return [ya, tidak]
  }

  const hitungNormal = (ambil: (k: Kunjungan) => string | null | undefined, labelNormal: string): [number, number] => {
    let normal = 0
    let tidakNormal = 0
    for (const k of daftarKunjungan) {
      if (normalTidakNormal(ambil(k), labelNormal)) normal += 1
      else tidakNormal += 1
    }
    return [normal, tidakNormal]
  }

  const [ceklisLengkap, ceklisTidakLengkap] = hitungDua((k) => k.ceklis_perkembangan)
  const [bbNaik, bbTidakNaik] = hitungDua((k) => k.bb_naik_tidak)
  const [bbuNormal, bbuTidakNormal] = hitungNormal((k) => k.bb_menurut_umur, 'Normal')
  const [tbuNormal, tbuTidakNormal] = hitungNormal((k) => k.pbtb_menurut_umur, 'Normal')
  const [bbtbNormal, bbtbTidakNormal] = hitungNormal((k) => k.bb_menurut_pbtb, 'Gizi Baik')
  const [likaNormal, likaTidakNormal] = hitungNormal((k) => k.status_lingkar_kepala, 'Normal')
  const [lilaNormal, lilaTidakNormal] = hitungNormal((k) => k.status_lingkar_lengan, 'Normal')
  const [imunisasiYa, imunisasiTidak] = hitungDua((k) => k.imunisasi)
  const [vitaminYa, vitaminTidak] = hitungDua((k) => k.vitamin_a)
  const [asiYa, asiTidak] = hitungDua((k) => k.asi_eksklusif)
  const [mpasiYa, mpasiTidak] = hitungDua((k) => k.mp_asi)
  const [cacingYa, cacingTidak] = hitungDua((k) => k.obat_cacing)
  const [edukasiYa, edukasiTidak] = hitungDua((k) => k.edukasi)

  return {
    sasaran_bayi: sasaranBayi,
    sasaran_balita: sasaranBalita,
    bayi_hadir: bayiHadir,
    bayi_tidak_hadir: sasaranBayi - bayiHadir,
    balita_hadir: balitaHadir,
    balita_tidak_hadir: sasaranBalita - balitaHadir,
    ceklis_lengkap: ceklisLengkap,
    ceklis_tidak_lengkap: ceklisTidakLengkap,
    bb_naik: bbNaik,
    bb_tidak_naik: bbTidakNaik,
    bbu_normal: bbuNormal,
    bbu_tidak_normal: bbuTidakNormal,
    tbu_normal: tbuNormal,
    tbu_tidak_normal: tbuTidakNormal,
    bbtb_normal: bbtbNormal,
    bbtb_tidak_normal: bbtbTidakNormal,
    lika_normal: likaNormal,
    lika_tidak_normal: likaTidakNormal,
    lila_normal: lilaNormal,
    lila_tidak_normal: lilaTidakNormal,
    imunisasi_ya: imunisasiYa,
    imunisasi_tidak: imunisasiTidak,
    vitamin_ya: vitaminYa,
    vitamin_tidak: vitaminTidak,
    asi_ya: asiYa,
    asi_tidak: asiTidak,
    mpasi_ya: mpasiYa,
    mpasi_tidak: mpasiTidak,
    cacing_ya: cacingYa,
    cacing_tidak: cacingTidak,
    edukasi_ya: edukasiYa,
    edukasi_tidak: edukasiTidak,
  }
}

// Satu baris rekap: identitas balita + data kunjungan terakhir.
// umur_bulan memakai kolom kunjungan bila ada, fallback hitung dari tanggal lahir vs kunjungan.
export function susunBarisRekap(balita: Balita, k: Kunjungan): BarisRekap {
  let umurBulan = k.umur_bulan
  if (umurBulan == null) {
    const lahir = parseTanggal(balita.tanggal_lahir)
    const kunjungan = parseTanggal(k.tanggal_kunjungan ?? '')
    if (lahir && kunjungan) umurBulan = hitungUmurBulan(lahir, kunjungan)
  }
  return {
    nama: balita.nama,
    jenis_kelamin: balita.jenis_kelamin,
    tanggal_lahir: balita.tanggal_lahir,
    umur_bulan: umurBulan,
    dusun: balita.dusun,
    posyandu: balita.posyandu,
    tanggal_kunjungan: k.tanggal_kunjungan,
    berat_badan: k.berat_badan,
    tinggi_badan: k.tinggi_badan,
    bb_menurut_umur: k.bb_menurut_umur,
    pbtb_menurut_umur: k.pbtb_menurut_umur,
    bb_menurut_pbtb: k.bb_menurut_pbtb,
    status_lingkar_kepala: k.status_lingkar_kepala,
    status_lingkar_lengan: k.status_lingkar_lengan,
    z_bb_u: k.z_bb_u,
    z_tb_u: k.z_tb_u,
    z_bb_tb: k.z_bb_tb,
  }
}