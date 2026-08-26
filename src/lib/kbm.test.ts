import { describe, expect, it } from 'vitest'
import { hitungKbm, statusNaikDariTanggal, statusNaikPerKbm } from './kbm'

describe('hitungKbm', () => {
  it('mengikuti tabel tetap untuk usia 1-6 bulan apa pun jarak kunjungan', () => {
    const harapan = [0, 800, 900, 800, 600, 500, 400]
    for (let usia = 1; usia <= 6; usia++) {
      expect(hitungKbm(usia)).toBe(harapan[usia])
      // Nilai tetap: tidak diprorata walau kader bolong sebulan.
      expect(hitungKbm(usia, 2)).toBe(harapan[usia])
    }
    expect(hitungKbm(0)).toBe(800)
  })

  it('menghitung 300 g per bulan untuk usia 7-11 bulan dengan prorata jarak', () => {
    for (let usia = 7; usia <= 11; usia++) {
      expect(hitungKbm(usia)).toBe(300)
      expect(hitungKbm(usia, 2)).toBe(600)
      expect(hitungKbm(usia, 3)).toBe(900)
    }
  })

  it('menghitung 200 g per bulan untuk usia 12 bulan ke atas (termasuk fallback >60)', () => {
    for (const usia of [12, 24, 60, 61, 72]) {
      expect(hitungKbm(usia)).toBe(200)
      expect(hitungKbm(usia, 2)).toBe(400)
    }
  })
})

describe('statusNaikPerKbm', () => {
  it('menyatakan Naik bila kenaikan mencapai KBM (batas inklusif)', () => {
    // Usia 14 bulan, KBM 200 g: naik tepat 200 g → Naik.
    expect(statusNaikPerKbm(8.2, 8.0, 14)).toEqual({ kenaikanG: 200, kbmG: 200, naik: true })
  })

  it('menyatakan Tidak Naik bila kenaikan di bawah KBM', () => {
    // Usia 3 bulan, KBM 800 g: naik 700 g → Tidak Naik.
    expect(statusNaikPerKbm(6.7, 6.0, 3)).toEqual({ kenaikanG: 700, kbmG: 800, naik: false })
  })

  it('menyatakan Naik untuk BB turun? tidak — BB turun selalu Tidak Naik', () => {
    const hasil = statusNaikPerKbm(7.5, 8.0, 20)!
    expect(hasil.naik).toBe(false)
    expect(hasil.kenaikanG).toBe(-500)
  })

  it('mengembalikan null untuk data tidak wajar', () => {
    expect(statusNaikPerKbm(0, 8.0, 10)).toBeNull()
    expect(statusNaikPerKbm(8.0, -1, 10)).toBeNull()
    expect(statusNaikPerKbm(8.0, 8.0, -2)).toBeNull()
  })
})

describe('statusNaikDariTanggal', () => {
  const lahir = '2025-06-15'

  it('menghitung usia & jarak kunjungan dari tanggal kalender', () => {
    // Lahir 2025-06-15; kunjungan lalu 2025-09-01 (usia ~2 bln), kini 2025-10-01.
    // Usia saat kini ≈ 3 bulan → KBM tetap 800 g; jarak 1 bulan.
    const hasil = statusNaikDariTanggal(lahir, '2025-10-01', '2025-09-01', 7.9, 7.0)!
    expect(hasil.kbmG).toBe(800)
    expect(hasil.kenaikanG).toBe(900)
    expect(hasil.naik).toBe(true)
  })

  it('prorata berlaku untuk balita 12 bulan ke atas yang bolong sebulan', () => {
    // Lahir 2024-08-10; lalu 2025-09-01 (usia ~12 bln), kini 2025-11-01 (jarak 2 bln).
    const hasil = statusNaikDariTanggal('2024-08-10', '2025-11-01', '2025-09-01', 9.9, 9.5)!
    expect(hasil.kbmG).toBe(400)
    expect(hasil.naik).toBe(true)
  })

  it('mengembalikan null bila tanggal tidak valid atau urutannya terbalik', () => {
    expect(statusNaikDariTanggal(lahir, 'bukan-tanggal', '2025-09-01', 8, 7)).toBeNull()
    expect(statusNaikDariTanggal(lahir, '2025-09-01', '2025-10-01', 8, 7)).toBeNull()
    expect(statusNaikDariTanggal(null, '2025-10-01', '2025-09-01', 8, 7)).toBeNull()
  })
})
