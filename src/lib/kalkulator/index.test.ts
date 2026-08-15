import { describe, expect, it } from 'vitest'
import expected from './__fixtures__/expected.json'
import { hitungSemuaStatus, klasifikasiBbtb, klasifikasiBbu, klasifikasiLika, klasifikasiLila, klasifikasiTbu } from './index'

interface KasusFixture {
  jk: string
  umur_bulan: number
  berat_badan: number
  panjang_badan: number
  status_bb_u: string
  status_tb_u: string
  status_bb_tb: string
  z_bb_u: number | null
  z_tb_u: number | null
  z_bb_tb: number | null
  error: string | null
}

const kasus = expected as KasusFixture[]

describe('hitungSemuaStatus vs fixture Python', () => {
  it.each(kasus)(
    'kasus jk=$jk umur=$umur_bulan bulan BB=$berat_badan PB=$panjang_badan',
    (k) => {
      const r = hitungSemuaStatus(k.jk, k.umur_bulan, k.berat_badan, k.panjang_badan)
      expect(r.status_bb_u).toBe(k.status_bb_u)
      expect(r.status_tb_u).toBe(k.status_tb_u)
      expect(r.status_bb_tb).toBe(k.status_bb_tb)
      expect(r.z_bb_u).toBeCloseTo(k.z_bb_u ?? 0, 2)
      expect(r.z_tb_u).toBeCloseTo(k.z_tb_u ?? 0, 2)
      expect(r.z_bb_tb).toBeCloseTo(k.z_bb_tb ?? 0, 2)
      expect(r.error).toBe(k.error)
    },
  )
})

describe('validasi rumus dasar', () => {
  it('l === 0 memakai logaritma natural', () => {
    const z = hitungSemuaStatus('L', 6, 7.9, 66.5)
    expect(z.error).toBeNull()
    expect(z.status_bb_u).toBe('N')
  })

  it('klasifikasi BB/U: RBL untuk z > 1', () => {
    const z = hitungSemuaStatus('L', 12, 16, 75)
    expect(z.z_bb_u ?? 0).toBeGreaterThan(1)
    expect(z.status_bb_u).toBe('RBL')
  })

  it('data tidak lengkap mengembalikan error', () => {
    const z = hitungSemuaStatus('L', 12, 0, 75)
    expect(z.error).toBe('Data tidak lengkap')
  })
})

// Boundary klasifikasi BB/TB — 6 kategori, non-overlap (tidak ada z masuk dua kategori).
describe('boundary klasifikasi BB/TB (6 kategori)', () => {
  const kasus: [number, string][] = [
    [-3.01, 'GB'], // Gizi Buruk
    [-3.0, 'GK'], // Gizi Kurang
    [-2.99, 'GK'],
    [-2.0, 'GN'], // Gizi Baik
    [-1.99, 'GN'],
    [1.0, 'GN'],
    [1.01, 'RGL'], // Risiko Gizi Lebih
    [2.0, 'RGL'],
    [2.01, 'GL'], // Gizi Lebih
    [3.0, 'GL'],
    [3.01, 'O'], // Obesitas
  ]
  it.each(kasus)('z = %s → %s', (z, kode) => {
    expect(klasifikasiBbtb(z)).toBe(kode)
  })
})

// Boundary klasifikasi BB/U, TB/U, LiKA, LiLA — pastikan tidak overlap.
describe('boundary klasifikasi indikator lain', () => {
  it('BB/U: z=-3 → K, z=-2 → N, z=1 → N, z=1.01 → RBL', () => {
    expect(klasifikasiBbu(-3.0)).toBe('K')
    expect(klasifikasiBbu(-2.0)).toBe('N')
    expect(klasifikasiBbu(1.0)).toBe('N')
    expect(klasifikasiBbu(1.01)).toBe('RBL')
  })

  it('TB/U: z=-3 → P, z=-2 → N, z=1 → N, z=1.01 → T', () => {
    expect(klasifikasiTbu(-3.0)).toBe('P')
    expect(klasifikasiTbu(-2.0)).toBe('N')
    expect(klasifikasiTbu(1.0)).toBe('N')
    expect(klasifikasiTbu(1.01)).toBe('T')
  })

  it('LiKA: z=-2 → N, z=2 → N, z=2.01 → MK', () => {
    expect(klasifikasiLika(-2.0)).toBe('N')
    expect(klasifikasiLika(2.0)).toBe('N')
    expect(klasifikasiLika(2.01)).toBe('MK')
  })

  it('LiLA: z=-2 → N, z=-2.01 → GK', () => {
    expect(klasifikasiLila(-2.0)).toBe('N')
    expect(klasifikasiLila(-2.01)).toBe('GK')
  })
})
