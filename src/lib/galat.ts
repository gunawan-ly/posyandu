// Normalisasi galat menjadi pesan bahasa Indonesia yang mudah dipahami kader.
// Dipakai di lapisan data (db.ts) dan auth agar semua tampilan otomatis
// menerima Error berpesan Indonesia tanpa perlu mengubah blok catch-nya.

const GALAT_TAK_TERDUGA = 'Terjadi kesalahan tak terduga. Coba lagi.'
const GALAT_JARINGAN = 'Koneksi ke server gagal. Periksa sinyal internet, lalu coba lagi.'

// Bentuk PostgrestError dari Supabase (objek polos: code/details/hint/message).
interface SepertiPostgrest {
  code?: string
  message?: string
  details?: unknown
  hint?: unknown
}

function adalahPostgrest(e: object): e is SepertiPostgrest {
  return 'message' in e && 'details' in e && 'hint' in e && typeof (e as SepertiPostgrest).code === 'string'
}

// Kode galat PostgreSQL yang paling mungkin ditemui kader.
const PETA_KODE_POSTGREST: Record<string, string> = {
  '23505': 'Data serupa sudah ada di database. Periksa kembali isian Anda.',
  '42501': 'Akses ditolak. Hanya admin yang dapat mengubah atau menghapus data ini.',
  '23503': 'Data terkait tidak ditemukan atau masih dipakai oleh data lain.',
  '42P01': 'Tabel belum tersedia di database. Hubungi pengelola.',
  '22P02': 'Format nilai tidak sesuai. Periksa kembali isian Anda.',
}

// Pola pesan autentikasi Supabase (AuthApiError memperluas Error).
const PESA_AUTH: Array<[RegExp, string]> = [
  [/invalid login credentials|user not found/i, 'Email atau kata sandi salah.'],
  [/email not confirmed/i, 'Email belum dikonfirmasi. Silakan periksa kotak masuk email Anda.'],
  [/password should be at least/i, 'Kata sandi minimal 6 karakter.'],
  [/rate limit|too many requests/i, 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'],
  [/user already registered|already been registered/i, 'Email sudah terdaftar.'],
]

export function pesanGalat(e: unknown): string {
  if (e instanceof TypeError) return GALAT_JARINGAN

  const teks = e instanceof Error ? e.message : String(e ?? '')
  if (/failed to fetch|fetch failed|networkerror|load failed/i.test(teks)) return GALAT_JARINGAN

  for (const [pola, pesan] of PESA_AUTH) {
    if (pola.test(teks)) return pesan
  }

  if (e != null && typeof e === 'object' && adalahPostgrest(e)) {
    const petakan = PETA_KODE_POSTGREST[e.code ?? '']
    if (petakan) return petakan
    if (e.message) return `Galat database: ${e.message}`
  }

  // Galat bawaan aplikasi (sudah berbahasa Indonesia) — lewarkan apa adanya.
  if (e instanceof Error) return teks || GALAT_TAK_TERDUGA
  if (typeof e === 'string' && e.trim()) return e

  return GALAT_TAK_TERDUGA
}

// Ubah galat apa pun menjadi Error berpesan Indonesia lalu lemparkan.
export function lemparGalat(e: unknown): never {
  throw new Error(pesanGalat(e))
}
