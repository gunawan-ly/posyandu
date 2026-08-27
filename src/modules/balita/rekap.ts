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
  gejala_tbc_ya: number
  sakit_ya: number
  dirujuk_bayi: number
  dirujuk_balita: number
}

export interface BarisRekap {
  modul: 'Balita' | 'Apras'
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

// ---- Gabungan lintas modul (v2.32.0): Balita + Apras dalam satu rekap ----
// Kunci memakai prefiks modul ("balita:12" / "apras:3") agar id antar tabel
// tidak saling bertabrakan. Kolom yang tidak dimiliki Apras diisi null dan
// otomatis tidak menyumbang angka (aturan baku: kosong tak dihitung).

export interface AnakGabungan {
  /** Identitas unik anak lintas modul, cth "balita:12". */
  kunci: string
  tanggal_lahir: string
}

export interface KunjunganGabungan {
  /** Identitas unik baris kunjungan lintas modul. */
  kunci: string
  /** Kunci identitas anak pemilik kunjungan. */
  anakKunci: string
  tanggal_kunjungan: string | null
  ceklis_perkembangan: string | null
  bb_naik_tidak: string | null
  bb_menurut_umur: string | null
  pbtb_menurut_umur: string | null
  bb_menurut_pbtb: string | null
  status_lingkar_kepala: string | null
  status_lingkar_lengan: string | null
  imunisasi: string | null
  vitamin_a: string | null
  asi_eksklusif: string | null
  mp_asi: string | null
  obat_cacing: string | null
  edukasi: string | null
  gejala_tbc: string | null
  sakit: string | null
  dirujuk: string | null
}

export function gabungAnakBalita(b: Pick<Balita, 'id' | 'tanggal_lahir'>): AnakGabungan {
  return { kunci: `balita:${b.id}`, tanggal_lahir: b.tanggal_lahir }
}

export function gabungKunjunganBalita(k: Kunjungan): KunjunganGabungan {
  return {
    kunci: `balita:${k.id}`,
    anakKunci: k.balita_id != null ? `balita:${k.balita_id}` : '',
    tanggal_kunjungan: k.tanggal_kunjungan,
    ceklis_perkembangan: k.ceklis_perkembangan,
    bb_naik_tidak: k.bb_naik_tidak,
    bb_menurut_umur: k.bb_menurut_umur,
    pbtb_menurut_umur: k.pbtb_menurut_umur,
    bb_menurut_pbtb: k.bb_menurut_pbtb,
    status_lingkar_kepala: k.status_lingkar_kepala,
    status_lingkar_lengan: k.status_lingkar_lengan,
    imunisasi: k.imunisasi,
    vitamin_a: k.vitamin_a,
    asi_eksklusif: k.asi_eksklusif,
    mp_asi: k.mp_asi,
    obat_cacing: k.obat_cacing,
    edukasi: k.edukasi,
    gejala_tbc: k.gejala_tbc,
    sakit: k.sakit,
    dirujuk: k.dirujuk,
  }
}

// Satu suara per anak pada dataset gabungan (urut tanggal naik, tiebreak kunci).
export function satuSuaraPerAnak(kunjungan: KunjunganGabungan[]): Map<string, KunjunganGabungan> {
  const urut = [...kunjungan].sort((a, b) => {
    const ta = a.tanggal_kunjungan ?? ''
    const tb = b.tanggal_kunjungan ?? ''
    if (ta !== tb) return ta < tb ? -1 : 1
    return a.kunci < b.kunci ? -1 : 1
  })
  const hasil = new Map<string, KunjunganGabungan>()
  for (const k of urut) {
    if (k.anakKunci) hasil.set(k.anakKunci, k)
  }
  return hasil
}

// Sasaran: umur < 12 bulan = bayi; 12–60 bulan = balita; tanggal lahir tidak valid → balita (aman).
export function klasifikasiSasaran(tanggalLahir: string, refTanggal: Date): 'bayi' | 'balita' {
  const lahir = parseTanggal(tanggalLahir)
  if (!lahir) return 'balita'
  return hitungUmurBulan(lahir, refTanggal) < 12 ? 'bayi' : 'balita'
}

// Nilai "Ya": cocok dengan pola Y/Ya/lengkap/L/1/benar (trim, case-insensitive).
// Mencakup nilai form baru ('Ya', 'L') maupun data lama ('Y', 'lengkap').
// Pemanggil wajib melewatkan nilai kosong lebih dulu (aturan: kosong tidak dihitung).
function fungsiAktif(nilai: string | null | undefined): boolean {
  if (nilai == null) return false
  return /^(y|ya|lengkap|l|1|benar)$/i.test(nilai.trim())
}

// BB naik punya TIGA keadaan: Naik, Tidak Naik, dan kosong.
// Kunjungan tanpa isi (null/kosong) TIDAK dihitung pada kedua kolom —
// sesuai aturan Awan: tidak boleh diasumsikan "Tidak Naik" bila tidak diisi.
const POLA_NAIK = /^(y|ya|naik|1|benar)$/i
const POLA_TIDAK_NAIK = /^(t|tidak|tidak naik|0)$/i

function hitungBbNaik(kunjungan: { bb_naik_tidak: string | null }[]): [number, number] {
  let naik = 0
  let tidakNaik = 0
  for (const k of kunjungan) {
    const v = (k.bb_naik_tidak ?? '').trim()
    if (!v) continue
    if (POLA_NAIK.test(v)) naik += 1
    else if (POLA_TIDAK_NAIK.test(v)) tidakNaik += 1
  }
  return [naik, tidakNaik]
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
  kunjunganGabungan: KunjunganGabungan[],
  anak: AnakGabungan[],
  periode: PeriodeRekap,
): RekapBulanan {
  const refTanggal = tanggalAkhirPeriode(periode)
  const suara = satuSuaraPerAnak(kunjunganGabungan)
  const daftarKunjungan = [...suara.values()]
  const anakMap = new Map(anak.map((a) => [a.kunci, a]))

  // Sasaran dihitung dari SEMUA anak terdata (gabungan modul); kehadiran
  // memakai satu suara per anak. Anak Apras (>60 bln) masuk keranjang Balita.
  const sasaranBayi = anak.filter((a) => klasifikasiSasaran(a.tanggal_lahir, refTanggal) === 'bayi').length
  const sasaranBalita = anak.length - sasaranBayi
  let bayiHadir = 0
  let balitaHadir = 0
  for (const a of anak) {
    if (!suara.has(a.kunci)) continue
    if (klasifikasiSasaran(a.tanggal_lahir, refTanggal) === 'bayi') bayiHadir += 1
    else balitaHadir += 1
  }

  // Dua kolom Ya/Tidak sekaligus atas kunjungan terakhir per anak.
  // Aturan (Awan): nilai terisi & bukan pola Ya → "Tidak"; kosong/tak diisi →
  // tidak dihitung di kedua kolom (tidak diasumsikan apa pun).
  const hitungDua = (ambil: (k: KunjunganGabungan) => string | null | undefined): [number, number] => {
    let ya = 0
    let tidak = 0
    for (const k of daftarKunjungan) {
      const v = (ambil(k) ?? '').trim()
      if (!v) continue
      if (fungsiAktif(v)) ya += 1
      else tidak += 1
    }
    return [ya, tidak]
  }

  // Pasangan Normal/Tidak Normal memakai aturan yang sama: terisi & bukan label
  // normal → "Tidak Normal"; kosong (belum diukur/status tak bisa dihitung) →
  // tidak masuk hitungan.
  const hitungNormal = (ambil: (k: KunjunganGabungan) => string | null | undefined, labelNormal: string): [number, number] => {
    let normal = 0
    let tidakNormal = 0
    for (const k of daftarKunjungan) {
      const v = (ambil(k) ?? '').trim()
      if (!v) continue
      if (normalTidakNormal(v, labelNormal)) normal += 1
      else tidakNormal += 1
    }
    return [normal, tidakNormal]
  }

  const [ceklisLengkap, ceklisTidakLengkap] = hitungDua((k) => k.ceklis_perkembangan)
  const [bbNaik, bbTidakNaik] = hitungBbNaik(daftarKunjungan)
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
  const [gejalaTbcYa] = hitungDua((k) => k.gejala_tbc)
  const [sakitYa] = hitungDua((k) => k.sakit)

  // Dirujuk dihitung per usia: bayi (<12 bln) vs balita (≥12 bln).
  let dirujukBayi = 0
  let dirujukBalita = 0
  for (const k of daftarKunjungan) {
    const v = (k.dirujuk ?? '').trim()
    if (!v || !fungsiAktif(v)) continue
    const anak = anakMap.get(k.anakKunci)
    if (anak && klasifikasiSasaran(anak.tanggal_lahir, refTanggal) === 'bayi') dirujukBayi += 1
    else dirujukBalita += 1
  }

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
    gejala_tbc_ya: gejalaTbcYa,
    sakit_ya: sakitYa,
    dirujuk_bayi: dirujukBayi,
    dirujuk_balita: dirujukBalita,
  }
}

// Rekap tahunan: hitung 12 bulan untuk satu tahun, return array 12 elemen.
export function hitungRekapTahunan(
  kunjunganGabungan: KunjunganGabungan[],
  anak: AnakGabungan[],
  tahun: number,
): RekapBulanan[] {
  return Array.from({ length: 12 }, (_, i) =>
    hitungRekapBulanan(kunjunganGabungan, anak, { bulan: i, tahun }),
  )
}

// Satu baris rekap: identitas anak + data kunjungan terakhir.
// umur_bulan memakai kolom kunjungan bila ada, fallback hitung dari tanggal lahir vs kunjungan.
export function susunBarisRekap(balita: Balita, k: Kunjungan): BarisRekap {
  let umurBulan = k.umur_bulan
  if (umurBulan == null) {
    const lahir = parseTanggal(balita.tanggal_lahir)
    const kunjungan = parseTanggal(k.tanggal_kunjungan ?? '')
    if (lahir && kunjungan) umurBulan = hitungUmurBulan(lahir, kunjungan)
  }
  return {
    modul: 'Balita',
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

// Struktur identitas minimum anak Apras untuk baris rincian (tanpa impor lintas db).
export interface AnakStruktur {
  nama: string
  jenis_kelamin: string | null
  tanggal_lahir: string
  dusun: string | null
  posyandu: string | null
}

// Baris rincian utk anak Apras: tanpa status/z-score (referensi WHO hanya s.d. 60 bln).
export function susunBarisApras(
  anak: AnakStruktur,
  k: { tanggal_kunjungan: string | null; umur_bulan: number | null; berat_badan: number | null; tinggi_badan: number | null },
): BarisRekap {
  let umurBulan = k.umur_bulan
  if (umurBulan == null) {
    const lahir = parseTanggal(anak.tanggal_lahir)
    const kunjungan = parseTanggal(k.tanggal_kunjungan ?? '')
    if (lahir && kunjungan) umurBulan = hitungUmurBulan(lahir, kunjungan)
  }
  return {
    modul: 'Apras',
    nama: anak.nama,
    jenis_kelamin: anak.jenis_kelamin,
    tanggal_lahir: anak.tanggal_lahir,
    umur_bulan: umurBulan,
    dusun: anak.dusun,
    posyandu: anak.posyandu,
    tanggal_kunjungan: k.tanggal_kunjungan,
    berat_badan: k.berat_badan,
    tinggi_badan: k.tinggi_badan,
    bb_menurut_umur: null,
    pbtb_menurut_umur: null,
    bb_menurut_pbtb: null,
    status_lingkar_kepala: null,
    status_lingkar_lengan: null,
    z_bb_u: null,
    z_tb_u: null,
    z_bb_tb: null,
  }
}