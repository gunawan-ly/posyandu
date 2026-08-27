import { describe, expect, it, vi } from 'vitest'

// Mock klien Supabase agar import berantai db.ts tidak menyentuh jaringan/env.
// Fungsi yang diuji di sini murni (konstanta & pemetaan label), tanpa DB.
vi.mock('@/supabase/client', () => ({
  wajibSupabase: vi.fn(),
}))

import {
  KATEGORI_BUMIL,
  OPSI_BB_KURVA,
  OPSI_LILA,
  OPSI_TD_KURVA,
  OPSI_YA_TIDAK,
  labelYaTidak,
} from './db'

describe('konstanta opsi modul bumil', () => {
  it('KATEGORI_BUMIL berisi Hamil, Menyusui, dan Nifas', () => {
    expect(KATEGORI_BUMIL).toEqual(['Hamil', 'Menyusui', 'Nifas'])
  })

  it('OPSI_BB_KURVA berisi nilai kurva BB KIA', () => {
    expect(OPSI_BB_KURVA).toEqual(['Sesuai', 'Tidak Sesuai'])
  })

  it('OPSI_LILA berisi Hijau dan Merah', () => {
    expect(OPSI_LILA).toEqual(['Hijau', 'Merah'])
  })

  it('OPSI_TD_KURVA berisi Normal dan Tinggi', () => {
    expect(OPSI_TD_KURVA).toEqual(['Normal', 'Tinggi'])
  })

  it('OPSI_YA_TIDAK berisi Ya dan Tidak', () => {
    expect(OPSI_YA_TIDAK).toEqual(['Ya', 'Tidak'])
  })
})

describe('labelYaTidak', () => {
  it('mengembalikan "—" untuk nilai null/undefined/kosong', () => {
    expect(labelYaTidak(null)).toBe('—')
    expect(labelYaTidak(undefined)).toBe('—')
    expect(labelYaTidak('')).toBe('—')
  })

  it('memetakan kode data lama Y/T ke Ya/Tidak', () => {
    expect(labelYaTidak('Y')).toBe('Ya')
    expect(labelYaTidak('T')).toBe('Tidak')
  })

  it('nilai "Ya" dan "Tidak" lolos apa adanya', () => {
    expect(labelYaTidak('Ya')).toBe('Ya')
    expect(labelYaTidak('Tidak')).toBe('Tidak')
  })

  it('string lain lolos apa adanya', () => {
    expect(labelYaTidak('Mungkin')).toBe('Mungkin')
  })
})
