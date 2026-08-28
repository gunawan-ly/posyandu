// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buangDariAntre, buangSemuaGagal, setDaring, sinkronkan, tambahKeAntre, useOfflineAntre } from './offlineAntre'

const {
  ambilBalita,
  tambahKunjungan,
  ambilBumil,
  tambahKunjunganBumil,
  ambilApras,
  tambahKunjunganApras,
  ambilRemaja,
  tambahKunjunganRemaja,
} = vi.hoisted(() => ({
  ambilBalita: vi.fn(),
  tambahKunjungan: vi.fn(),
  ambilBumil: vi.fn(),
  tambahKunjunganBumil: vi.fn(),
  ambilApras: vi.fn(),
  tambahKunjunganApras: vi.fn(),
  ambilRemaja: vi.fn(),
  tambahKunjunganRemaja: vi.fn(),
}))

vi.mock('@/modules/balita/db', () => ({
  ambilBalita: (...a: unknown[]) => ambilBalita(...(a as [])),
  tambahKunjungan: (...a: unknown[]) => tambahKunjungan(...(a as [])),
}))
vi.mock('@/modules/bumil/db', () => ({
  ambilBumil: (...a: unknown[]) => ambilBumil(...(a as [])),
  tambahKunjunganBumil: (...a: unknown[]) => tambahKunjunganBumil(...(a as [])),
}))
vi.mock('@/modules/apras/db', () => ({
  ambilApras: (...a: unknown[]) => ambilApras(...(a as [])),
  tambahKunjunganApras: (...a: unknown[]) => tambahKunjunganApras(...(a as [])),
}))
vi.mock('@/modules/remaja/db', () => ({
  ambilRemaja: (...a: unknown[]) => ambilRemaja(...(a as [])),
  tambahKunjunganRemaja: (...a: unknown[]) => tambahKunjunganRemaja(...(a as [])),
}))

function kosongkan() {
  const { daftar } = useOfflineAntre()
  for (const d of [...daftar.value]) buangDariAntre(d.uid)
}

// Bila runtime tak menyediakan Storage yang berfungsi (mis. lingkungan uji
// dengan shim rusak), antrean memakai cadangan memori — uji persistensi diskip.
const punyaStorage =
  typeof window !== 'undefined' &&
  typeof window.localStorage?.getItem === 'function' &&
  typeof window.localStorage?.setItem === 'function'

beforeEach(() => {
  kosongkan()
  setDaring(true)
  vi.clearAllMocks()
})

describe('tambahKeAntre', () => {
  it('menyimpan input mentah ke antrean', () => {
    tambahKeAntre({
      modul: 'balita',
      identitasId: 7,
      nama: 'Aisha',
      tanggal_kunjungan: '2026-08-01',
      isi: { berat_badan: 8.1 },
    })

    const { daftar, totalAntre } = useOfflineAntre()
    expect(totalAntre.value).toBe(1)
    const item = daftar.value[0]
    expect(item.modul).toBe('balita')
    expect(item.identitasId).toBe(7)
    expect(item.isi).toEqual({ berat_badan: 8.1 })
    expect(item.gagal).toBeFalsy()
    expect(item.uid).toBeTruthy()
    expect(item.dibuat).toBeTruthy()
  })

  it.skipIf(!punyaStorage)('menulis antrean ke localStorage', () => {
    tambahKeAntre({ modul: 'balita', identitasId: 7, nama: 'Aisha', tanggal_kunjungan: '2026-08-01', isi: {} })
    const tersimpan = JSON.parse(window.localStorage.getItem('posyandu-antre-kunjungan') ?? '[]')
    expect(tersimpan).toHaveLength(1)
    expect(tersimpan[0].nama).toBe('Aisha')
  })
})

describe('sinkronkan', () => {
  it('tidak mengirim apa pun saat offline — antre tetap utuh', async () => {
    tambahKeAntre({ modul: 'apras', identitasId: 3, nama: 'Bima', tanggal_kunjungan: '2026-08-01', isi: {} })
    setDaring(false)

    const hasil = await sinkronkan()
    expect(hasil).toEqual({ terkirim: 0, gagal: 0 })
    expect(useOfflineAntre().totalAntre.value).toBe(1)
    expect(tambahKunjunganApras).not.toHaveBeenCalled()
  })

  it('mengirim FIFO lalu membuang item yang sukses', async () => {
    ambilBalita.mockResolvedValue({ id: 7, nama: 'Aisha', tanggal_lahir: '2025-01-01' })
    tambahKunjungan.mockResolvedValue({ id: 100 })
    ambilBumil.mockResolvedValue({ id: 9, nama: 'Sari' })
    tambahKunjunganBumil.mockResolvedValue({ id: 101 })

    tambahKeAntre({ modul: 'balita', identitasId: 7, nama: 'Aisha', tanggal_kunjungan: '2026-08-01', isi: { berat_badan: 8.1 } })
    tambahKeAntre({ modul: 'bumil', identitasId: 9, nama: 'Sari', tanggal_kunjungan: '2026-08-02', isi: { berat_badan: 55 } })

    const hasil = await sinkronkan()
    expect(hasil).toEqual({ terkirim: 2, gagal: 0 })
    expect(useOfflineAntre().totalAntre.value).toBe(0)

    // Urutan FIFO + payload diteruskan apa adanya (status dihitung di db layer).
    expect(tambahKunjungan.mock.calls[0][1]).toEqual({ berat_badan: 8.1 })
    expect(tambahKunjunganBumil.mock.calls[0][1]).toEqual({ berat_badan: 55 })
    if (punyaStorage) {
      expect(window.localStorage.getItem('posyandu-antre-kunjungan')).toBe('[]')
    }
  })

  it('mengirim kunjungan remaja lewat antrean FIFO', async () => {
    ambilRemaja.mockResolvedValue({ id: 12, nama: 'Dewi' })
    tambahKunjunganRemaja.mockResolvedValue({ id: 200 })

    tambahKeAntre({ modul: 'remaja', identitasId: 12, nama: 'Dewi', tanggal_kunjungan: '2026-08-05', isi: { imt: 19.2, status_gizi: 'Normal' } })

    const hasil = await sinkronkan()
    expect(hasil).toEqual({ terkirim: 1, gagal: 0 })
    expect(useOfflineAntre().totalAntre.value).toBe(0)
    expect(ambilRemaja).toHaveBeenCalledWith(12)
    expect(tambahKunjunganRemaja.mock.calls[0][1]).toEqual({ imt: 19.2, status_gizi: 'Normal' })
  })

  it('galat non-jaringan menandai gagal dan tetap di antre', async () => {
    ambilApras.mockResolvedValue({ id: 3, nama: 'Bima' })
    tambahKunjunganApras.mockRejectedValue(new Error('Data serupa sudah ada.'))

    tambahKeAntre({ modul: 'apras', identitasId: 3, nama: 'Bima', tanggal_kunjungan: '2026-08-01', isi: {} })

    const hasil = await sinkronkan()
    expect(hasil).toEqual({ terkirim: 0, gagal: 1 })

    const { daftar, totalGagal } = useOfflineAntre()
    expect(totalGagal.value).toBe(1)
    expect(daftar.value[0].gagal).toBe(true)
    // Sinkron ulang melewati yang gagal (tidak dicoba lagi otomatis).
    const ulang = await sinkronkan()
    expect(ulang).toEqual({ terkirim: 0, gagal: 0 })

    buangSemuaGagal()
    expect(useOfflineAntre().totalAntre.value).toBe(0)
  })

  it('galat jaringan menghentikan sync — sisa antre tidak disentuh', async () => {
    ambilBalita.mockResolvedValue({ id: 1, nama: 'Cika' })
    tambahKunjungan
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ id: 102 })
    ambilBumil.mockResolvedValue({ id: 2, nama: 'Nia' })
    tambahKunjunganBumil.mockResolvedValue({ id: 103 })

    tambahKeAntre({ modul: 'balita', identitasId: 1, nama: 'Cika', tanggal_kunjungan: '2026-08-01', isi: {} })
    tambahKeAntre({ modul: 'bumil', identitasId: 2, nama: 'Nia', tanggal_kunjungan: '2026-08-01', isi: {} })

    const hasil = await sinkronkan()
    // Item pertama kena galat jaringan → sync langsung berhenti.
    expect(hasil).toEqual({ terkirim: 0, gagal: 0 })
    expect(useOfflineAntre().totalAntre.value).toBe(2)
  })
})
