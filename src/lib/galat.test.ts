import { describe, expect, it } from 'vitest'
import { lemparGalat, pesanGalat } from './galat'

describe('pesanGalat', () => {
  it('mendeteksi galat jaringan dari TypeError maupun teks fetch', () => {
    const daftar: unknown[] = [
      new TypeError('Failed to fetch'),
      new Error('fetch failed'),
      new Error('NetworkError when attempting to fetch resource.'),
      new Error('Load failed'),
    ]
    for (const g of daftar) {
      expect(pesanGalat(g)).toBe('Koneksi ke server gagal. Periksa sinyal internet, lalu coba lagi.')
    }
  })

  it('memetakan pesan autentikasi Supabase ke bahasa Indonesia', () => {
    expect(pesanGalat(new Error('Invalid login credentials'))).toBe('Email atau kata sandi salah.')
    expect(pesanGalat(new Error('Email not confirmed'))).toBe(
      'Email belum dikonfirmasi. Silakan periksa kotak masuk email Anda.',
    )
    expect(pesanGalat(new Error('User not found'))).toBe('Email atau kata sandi salah.')
  })

  it('memetakan kode PostgreSQL umum dari bentuk PostgrestError', () => {
    const rls = { code: '42501', message: 'new row violates row-level security policy', details: null, hint: null }
    const duplikat = { code: '23505', message: 'duplicate key value violates unique constraint', details: null, hint: null }
    expect(pesanGalat(rls)).toBe('Akses ditolak. Hanya admin yang dapat mengubah atau menghapus data ini.')
    expect(pesanGalat(duplikat)).toBe('Data serupa sudah ada di database. Periksa kembali isian Anda.')
  })

  it('kode PostgreSQL tak dikenal tetap ditampilkan dengan awalan Galat database', () => {
    const aneh = { code: 'XX999', message: 'something exploded', details: null, hint: null }
    expect(pesanGalat(aneh)).toBe('Galat database: something exploded')
  })

  it('melakukan passthrough untuk galat bawaan aplikasi yang sudah berbahasa Indonesia', () => {
    expect(pesanGalat(new Error('Tanggal kunjungan tidak valid.'))).toBe('Tanggal kunjungan tidak valid.')
    expect(pesanGalat(new Error('Gagal menyimpan data.'))).toBe('Gagal menyimpan data.')
  })

  it('menangani string, nilai kosong, dan bentuk tak dikenal tanpa melempar galat baru', () => {
    expect(pesanGalat('Sesi berakhir.')).toBe('Sesi berakhir.')
    expect(pesanGalat(undefined)).toBe('Terjadi kesalahan tak terduga. Coba lagi.')
    expect(pesanGalat(null)).toBe('Terjadi kesalahan tak terduga. Coba lagi.')
    expect(pesanGalat(new Error(''))).toBe('Terjadi kesalahan tak terduga. Coba lagi.')
  })
})

describe('lemparGalat', () => {
  it('melempar Error (bukan objek polos) berpesan Indonesia', () => {
    const mentah = { code: '42501', message: 'permission denied', details: null, hint: null }
    expect(() => lemparGalat(mentah)).toThrowError(Error)
    expect(() => lemparGalat(mentah)).toThrowError(
      'Akses ditolak. Hanya admin yang dapat mengubah atau menghapus data ini.',
    )
  })

  it('hasilnya instanceof Error sehingga pola catch lama (e instanceof Error) tetap bekerja', () => {
    try {
      lemparGalat({ code: '23505', message: 'dup', details: null, hint: null })
      expect.unreachable()
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect((e as Error).message).toContain('sudah ada')
    }
  })
})
