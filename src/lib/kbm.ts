import { hitungUmurBulan, parseTanggal } from './umur'

// Tabel Kenaikan Berat Badan Minimal (KBM) — acuan kader menilai apakah
// berat badan anak naik cukup sejak kunjungan sebelumnya:
//   1-6 bulan  : nilai tetap per kategori usia (gram)
//   7-11 bulan : 300 gram x jumlah bulan jarak kunjungan
//   >=12 bulan : 200 gram x jumlah bulan jarak kunjungan (fallback >60 bulan)
// <1 bulan memakai nilai kategori 1 bulan.

const KBM_TETAP: Record<number, number> = {
  1: 800,
  2: 900,
  3: 800,
  4: 600,
  5: 500,
  6: 400,
}
const KBM_7_SAMPAI_11 = 300
const KBM_PER_BULAN = 200

// KBM dalam gram untuk usia (bulan) dan jarak antar kunjungan (bulan, min 1).
export function hitungKbm(usiaBulan: number, selisihBulan = 1): number {
  const jarak = Math.max(1, Math.floor(selisihBulan))
  if (usiaBulan <= 1) return KBM_TETAP[1]
  if (usiaBulan <= 6) return KBM_TETAP[usiaBulan]
  if (usiaBulan <= 11) return KBM_7_SAMPAI_11 * jarak
  return KBM_PER_BULAN * jarak
}

export interface HasilKbm {
  /** Kenaikan BB aktual sejak kunjungan sebelumnya (gram). */
  kenaikanG: number
  /** KBM yang dipersyaratkan (gram). */
  kbmG: number
  /** true bila kenaikan mencapai KBM. */
  naik: boolean
}

// Bandingkan BB saat ini dengan BB kunjungan sebelumnya terhadap KBM.
// Mengembalikan null bila data tidak lengkap/tidak wajar.
export function statusNaikPerKbm(
  bbKiniKg: number,
  bbLaluKg: number,
  usiaBulan: number,
  selisihBulan = 1,
): HasilKbm | null {
  if (!(bbKiniKg > 0) || !(bbLaluKg > 0)) return null
  if (!(usiaBulan >= 0)) return null
  const kenaikanG = Math.round((bbKiniKg - bbLaluKg) * 1000)
  const kbmG = hitungKbm(usiaBulan, selisihBulan)
  return { kenaikanG, kbmG, naik: kenaikanG >= kbmG }
}

// Kemudahan pakai dari form: hitung status naik langsung dari tanggal & BB.
// `tanggalLahir`/`tglKini`/`tglLalu` berformat YYYY-MM-DD; mengembalikan
// null bila tanggal tidak valid atau BB tidak positif.
export function statusNaikDariTanggal(
  tanggalLahir: string | null | undefined,
  tglKini: string,
  tglLalu: string,
  bbKiniKg: number,
  bbLaluKg: number,
): HasilKbm | null {
  const lahir = tanggalLahir ? parseTanggal(tanggalLahir) : null
  const kini = parseTanggal(tglKini)
  const lalu = parseTanggal(tglLalu)
  if (!kini || !lalu) return null

  // Usia saat kunjungan sekarang; tanpa tanggal lahir → tidak bisa dinilai.
  if (!lahir) return null
  const umur = hitungUmurBulan(lahir, kini)
  if (kini.getTime() <= lalu.getTime()) return null
  const selisih = Math.max(1, hitungUmurBulan(lalu, kini))
  return statusNaikPerKbm(bbKiniKg, bbLaluKg, umur, selisih)
}
