import { describe, expect, it } from 'vitest'
import expected from './__fixtures__/expected.json'
import { hitungSemuaStatus } from './index'

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
