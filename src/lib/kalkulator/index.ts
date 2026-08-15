import {
  acfaBoy,
  acfaGirl,
  hcfaBoy,
  hcfaGirl,
  lhfaBoy2y,
  lhfaBoy5y,
  lhfaGirl2y,
  lhfaGirl5y,
  wfaBoy,
  wfaGirl,
  wfhBoy,
  wfhGirl,
  wflBoy,
  wflGirl,
  type BarisPanjang,
  type BarisUmur,
} from './tabel'

// Port TypeScript dari package/kalkulator_gizi.py (metode LMS standar WHO).
// Klasifikasi status mengikuti aturan yang sama persis dengan versi Python.

export interface HasilStatusGizi {
  status_bb_u: string
  status_tb_u: string
  status_bb_tb: string
  z_bb_u: number | null
  z_tb_u: number | null
  z_bb_tb: number | null
  error: string | null
}

export function hitungZScoreLms(nilaiAktual: number, l: number, m: number, s: number): number {
  if (l === 0) {
    return Math.log(nilaiAktual / m) / s
  }
  return (Math.pow(nilaiAktual / m, l) - 1) / (l * s)
}

export function bulatkan2(n: number): number {
  return Math.round(n * 100) / 100
}

// BB/U: SK (<-3), K (-3 s/d <-2), N (-2 s/d +1), RBL (>+1)
export function klasifikasiBbu(z: number): string {
  if (z < -3.0) return 'SK'
  if (z < -2.0) return 'K'
  if (z <= 1.0) return 'N'
  return 'RBL'
}

// TB/U: SP (<-3), P (-3 s/d <-2), N (-2 s/d +1), T (>+1)
export function klasifikasiTbu(z: number): string {
  if (z < -3.0) return 'SP'
  if (z < -2.0) return 'P'
  if (z <= 1.0) return 'N'
  return 'T'
}

// BB/TB: GK (<-2), GB (-2 s/d +1), GL (>+1 s/d +3), O (>+3)
export function klasifikasiBbtb(z: number): string {
  if (z < -2.0) return 'GK'
  if (z <= 1.0) return 'GB'
  if (z <= 3.0) return 'GL'
  return 'O'
}

// LiKA (lingkar kepala): Mikrosefali (<-2), Normal (-2 s/d +2), Makrosefali (>+2)
export function klasifikasiLika(z: number): string {
  if (z < -2.0) return 'MS' // Mikrosefali
  if (z <= 2.0) return 'N' // Normal
  return 'MK' // Makrosefali
}

// LiLA (lingkar lengan atas): Gizi Kurang (<-2), Normal (-2 ke atas)
export function klasifikasiLila(z: number): string {
  if (z < -2.0) return 'GK' // Gizi Kurang
  return 'N' // Normal
}

// Hitung z-score lingkar kepala (HC/A) dari tabel hcfa (0-60 bulan).
export function hitungZLik(jk: string, umurBulan: number, lingkarKepala: number): number | null {
  const tabel = jk === 'L' ? hcfaBoy : jk === 'P' ? hcfaGirl : null
  if (!tabel || !lingkarKepala) return null
  const baris = cariBarisUmur(tabel, umurBulan)
  if (!baris) return null
  return bulatkan2(hitungZScoreLms(lingkarKepala, baris.L, baris.M, baris.S))
}

// Hitung z-score lingkar lengan (MUAC/A) dari tabel acfa (3-60 bulan).
export function hitungZLil(jk: string, umurBulan: number, lingkarLengan: number): number | null {
  const tabel = jk === 'L' ? acfaBoy : jk === 'P' ? acfaGirl : null
  if (!tabel || !lingkarLengan) return null
  const baris = cariBarisUmur(tabel, umurBulan)
  if (!baris) return null
  return bulatkan2(hitungZScoreLms(lingkarLengan, baris.L, baris.M, baris.S))
}

function cariBarisUmur(tabel: readonly BarisUmur[], bulan: number): BarisUmur | undefined {
  return tabel.find((r) => r.kunci === bulan)
}

function cariBarisPanjangTerdekat(
  tabel: readonly BarisPanjang[],
  nilai: number,
): BarisPanjang | undefined {
  let terbaik: BarisPanjang | undefined
  let selisihTerbaik = Number.POSITIVE_INFINITY
  for (const r of tabel) {
    const selisih = Math.abs(r.kunci - nilai)
    if (selisih < selisihTerbaik) {
      selisihTerbaik = selisih
      terbaik = r
    }
  }
  return terbaik
}

function pilihTabelUmur(
  jenis: 'boys' | 'girls',
  indikator: 'bbu' | 'tbu',
  umurBulan: number,
): readonly BarisUmur[] {
  if (indikator === 'bbu') {
    return jenis === 'boys' ? wfaBoy : wfaGirl
  }
  if (umurBulan < 24) {
    return jenis === 'boys' ? lhfaBoy2y : lhfaGirl2y
  }
  return jenis === 'boys' ? lhfaBoy5y : lhfaGirl5y
}

export function hitungSemuaStatus(
  jk: string,
  umurBulan: number,
  beratBadan: number,
  panjangBadan: number,
): HasilStatusGizi {
  const hasil: HasilStatusGizi = {
    status_bb_u: '_',
    status_tb_u: '_',
    status_bb_tb: '_',
    z_bb_u: null,
    z_tb_u: null,
    z_bb_tb: null,
    error: null,
  }

  if (!beratBadan || !panjangBadan) {
    hasil.error = 'Data tidak lengkap'
    return hasil
  }

  const jenis = jk === 'L' ? 'boys' : jk === 'P' ? 'girls' : null
  if (!jenis) {
    hasil.error = 'Jenis kelamin tidak valid'
    return hasil
  }

  // 1. HITUNG BB/U (Berat Badan / Umur) — tabel wfa
  const barisBbu = cariBarisUmur(pilihTabelUmur(jenis, 'bbu', umurBulan), umurBulan)
  if (barisBbu) {
    const z = hitungZScoreLms(beratBadan, barisBbu.L, barisBbu.M, barisBbu.S)
    hasil.z_bb_u = bulatkan2(z)
    hasil.status_bb_u = klasifikasiBbu(z)
  } else {
    hasil.error = hasil.error || `Tidak ada data BB/U untuk umur ${umurBulan} bulan`
  }

  // 2. HITUNG PB/TB/U (Panjang/Tinggi Badan / Umur) — tabel lhfa
  const barisTbu = cariBarisUmur(pilihTabelUmur(jenis, 'tbu', umurBulan), umurBulan)
  if (barisTbu) {
    const z = hitungZScoreLms(panjangBadan, barisTbu.L, barisTbu.M, barisTbu.S)
    hasil.z_tb_u = bulatkan2(z)
    hasil.status_tb_u = klasifikasiTbu(z)
  } else {
    hasil.error = hasil.error || `Tidak ada data TB/U untuk umur ${umurBulan} bulan`
  }

  // 3. HITUNG BB/PB atau BB/TB — cari baris berdasarkan panjang/tinggi, bukan umur
  const tabelBbtb = umurBulan < 24 ? (jenis === 'boys' ? wflBoy : wflGirl) : (jenis === 'boys' ? wfhBoy : wfhGirl)
  const barisBbtb = cariBarisPanjangTerdekat(tabelBbtb, panjangBadan)
  if (barisBbtb) {
    const z = hitungZScoreLms(beratBadan, barisBbtb.L, barisBbtb.M, barisBbtb.S)
    hasil.z_bb_tb = bulatkan2(z)
    hasil.status_bb_tb = klasifikasiBbtb(z)
  } else {
    hasil.error = hasil.error || 'Gagal membaca tabel BB/TB'
  }

  return hasil
}
