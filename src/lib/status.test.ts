import { describe, expect, it } from 'vitest'
import type { ToneStatus } from './status'
import {
  DAFTAR_STATUS,
  TONE_BADGE,
  TONE_DOT,
  infoStatus,
  kodeDariLabel,
  labelStatus,
} from './status'

// Daftar tone sesuai tipe ToneStatus (untuk uji kunci peta tone).
const SEMUA_TONE: ToneStatus[] = ['danger', 'warning', 'ok', 'info']

describe('infoStatus', () => {
  it('mengembalikan InfoStatus lengkap untuk kode valid di DAFTAR_STATUS', () => {
    for (const [kode, info] of Object.entries(DAFTAR_STATUS)) {
      const hasil = infoStatus(kode)
      expect(hasil.kode).toBe(info.kode)
      expect(hasil.label).toBe(info.label)
      expect(hasil.deskripsi).toBe(info.deskripsi)
      expect(hasil.tone).toBe(info.tone)
    }
  })

  it('mengembalikan fallback "Belum dihitung" dengan tone info untuk kode null/undefined/kosong', () => {
    for (const masukan of [null, undefined, '']) {
      const hasil = infoStatus(masukan)
      expect(hasil.label).toBe('Belum dihitung')
      expect(hasil.tone).toBe('info')
      expect(hasil.deskripsi).toBe('Lengkapi data untuk melihat status.')
    }
  })

  it('kode tak dikenal tetap dikembalikan dengan label "Belum dihitung" dan kode aslinya', () => {
    const hasil = infoStatus('XX')
    expect(hasil.kode).toBe('XX')
    expect(hasil.label).toBe('Belum dihitung')
    expect(hasil.tone).toBe('info')
  })
})

describe('labelStatus', () => {
  it('memetakan semua kode DAFTAR_STATUS ke label Indonesia yang benar', () => {
    for (const [kode, info] of Object.entries(DAFTAR_STATUS)) {
      expect(labelStatus(kode)).toBe(info.label)
    }
  })

  it('memetakan kode lingkar kepala MS dan MK', () => {
    expect(labelStatus('MS')).toBe('Mikrosefali')
    expect(labelStatus('MK')).toBe('Makrosefali')
  })

  it('kode asing dikembalikan apa adanya', () => {
    expect(labelStatus('ZZ')).toBe('ZZ')
    expect(labelStatus('bukan-kode')).toBe('bukan-kode')
  })
})

describe('kodeDariLabel', () => {
  it('roundtrip labelStatus <-> kodeDariLabel untuk semua entri DAFTAR_STATUS', () => {
    for (const kode of Object.keys(DAFTAR_STATUS)) {
      const label = labelStatus(kode)
      expect(kodeDariLabel(label)).toBe(kode)
    }
  })

  it('menerima alias label data lama ke kode pendek', () => {
    expect(kodeDariLabel('Sangat Kurus')).toBe('SK')
    expect(kodeDariLabel('Kurus')).toBe('K')
    expect(kodeDariLabel('Berat Berlebih')).toBe('RBL')
    expect(kodeDariLabel('Risiko Berat Badan Lebih')).toBe('RBL')
    expect(kodeDariLabel('Risiko Berat Lebih')).toBe('RBL')
    expect(kodeDariLabel('Sangat Buruk')).toBe('GB')
  })

  it('mengembalikan "_" untuk label null/undefined/kosong', () => {
    expect(kodeDariLabel(null)).toBe('_')
    expect(kodeDariLabel(undefined)).toBe('_')
    expect(kodeDariLabel('')).toBe('_')
  })

  it('label asing dikembalikan apa adanya', () => {
    expect(kodeDariLabel('Label Aneh')).toBe('Label Aneh')
  })
})

describe('peta tone', () => {
  it('TONE_BADGE dan TONE_DOT memiliki tepat 4 kunci tone yang sama dengan ToneStatus', () => {
    const kunciBadge = Object.keys(TONE_BADGE).sort()
    const kunciDot = Object.keys(TONE_DOT).sort()
    const kunciTipe = [...SEMUA_TONE].sort()
    expect(kunciBadge).toEqual(kunciTipe)
    expect(kunciDot).toEqual(kunciTipe)
  })
})
